import dotenv from "dotenv";
import db from "../utils/prisma.js";
import { generateResponse } from "../services/ollamaService.js";
import { getNodeExecutable, hasNodeExecutable } from "../nodeExecutables/index.js";

dotenv.config();

/**
 * Execute a single node
 * Routes to either AI service or pre-defined node executable based on node type
 */
export const executeNode = async (req, res) => {
  try {
    const { node, input, workflowContext } = req.body;

    if (!node) {
      return res.status(400).json({
        success: false,
        error: "Node data is required"
      });
    }

    console.log('='.repeat(80));
    console.log('EXECUTING NODE:', node.name);
    console.log('Node Type:', node.isCommonAgent ? 'Common Agent (Pre-defined)' : 'AI Agent');
    console.log('='.repeat(80));

    let result;

    // Check if this is a common agent (pre-defined node)
    if (node.isCommonAgent && node.commonAgentId) {
      result = await executeCommonAgent(node, input);
    } else {
      // It's an AI agent - call the AI service
      result = await executeAIAgent(node, input, workflowContext);
    }

    res.status(200).json({
      success: true,
      nodeId: node.nodeId || node.id,
      nodeName: node.name,
      result
    });

  } catch (error) {
    console.error("Error executing node:", error);
    res.status(500).json({
      success: false,
      error: "Failed to execute node",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Execute a common agent (pre-defined node executable)
 */
const executeCommonAgent = async (node, input) => {
  try {
    // Get the common agent from database to find its identifier
    const commonAgent = await db.commonAgent.findUnique({
      where: { id: node.commonAgentId }
    });

    if (!commonAgent) {
      return {
        success: false,
        error: `Common agent not found: ${node.commonAgentId}`,
        output: null,
        executionType: 'common_agent'
      };
    }

    // Map common agent name to executable identifier
    const identifier = getExecutableIdentifier(commonAgent.name);

    if (!hasNodeExecutable(identifier)) {
      return {
        success: false,
        error: `No executable found for: ${commonAgent.name} (identifier: ${identifier})`,
        output: null,
        executionType: 'common_agent'
      };
    }

    // Get the executable
    const executable = getNodeExecutable(identifier);

    // Parse node settings
    const settings = parseSettings(node.settings);

    console.log('Executing common agent:', commonAgent.name);
    console.log('Identifier:', identifier);
    console.log('Settings:', settings);

    // Execute the node
    const result = await executable.execute(input, settings);

    return {
      ...result,
      executionType: 'common_agent',
      agentName: commonAgent.name,
      identifier
    };

  } catch (error) {
    console.error('Error executing common agent:', error);
    return {
      success: false,
      error: error.message,
      output: null,
      executionType: 'common_agent'
    };
  }
};

/**
 * Execute an AI agent using the Ollama service
 */
const executeAIAgent = async (node, input, workflowContext) => {
  try {
    // Build the prompt for the AI
    const prompt = buildAIPrompt(node, input, workflowContext);

    console.log('Executing AI agent:', node.name);
    console.log('Prompt preview:', prompt.substring(0, 200) + '...');

    // Call the AI service
    const aiResponse = await generateResponse(prompt);

    console.log('AI Response received');

    return {
      success: true,
      error: null,
      output: aiResponse,
      executionType: 'ai_agent',
      agentName: node.name
    };

  } catch (error) {
    console.error('Error executing AI agent:', error);

    // Handle specific error types from ollamaService
    if (error.code === 'OLLAMA_CONNECTION_ERROR') {
      return {
        success: false,
        error: error.message,
        output: null,
        executionType: 'ai_agent',
        errorCode: 'CONNECTION_ERROR'
      };
    }

    if (error.code === 'OLLAMA_TIMEOUT_ERROR') {
      return {
        success: false,
        error: error.message,
        output: null,
        executionType: 'ai_agent',
        errorCode: 'TIMEOUT_ERROR'
      };
    }

    return {
      success: false,
      error: error.message,
      output: null,
      executionType: 'ai_agent'
    };
  }
};

/**
 * Execute an entire workflow (all nodes in order)
 */
export const executeWorkflow = async (req, res) => {
  try {
    const { nodes, edges, teamId } = req.body;

    if (!nodes || nodes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No nodes provided for execution"
      });
    }

    console.log('='.repeat(80));
    console.log('EXECUTING WORKFLOW');
    console.log('Total Nodes:', nodes.length);
    console.log('Total Edges:', edges?.length || 0);
    console.log('='.repeat(80));

    // Get execution order using topological sort
    const executionOrder = getExecutionOrder(nodes, edges || []);

    if (executionOrder.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Could not determine execution order"
      });
    }

    const results = [];
    let previousOutput = null;

    // Execute nodes in order
    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId || n.nodeId === nodeId);

      if (!node) {
        console.warn(`Node not found: ${nodeId}`);
        continue;
      }

      console.log(`Executing node ${results.length + 1}/${executionOrder.length}: ${node.name}`);

      let result;
      const input = previousOutput;
      const workflowContext = {
        teamId,
        previousResults: results,
        totalNodes: nodes.length,
        currentIndex: results.length
      };

      if (node.isCommonAgent && node.commonAgentId) {
        result = await executeCommonAgent(node, input);
      } else {
        result = await executeAIAgent(node, input, workflowContext);
      }

      results.push({
        nodeId: node.id || node.nodeId,
        nodeName: node.name,
        ...result
      });

      // Pass output to next node
      previousOutput = result.output;

      // Stop if a node fails
      if (!result.success) {
        console.error(`Node ${node.name} failed, stopping workflow`);
        break;
      }
    }

    const allSuccessful = results.every(r => r.success);

    res.status(200).json({
      success: allSuccessful,
      message: allSuccessful
        ? 'Workflow executed successfully'
        : 'Workflow execution completed with errors',
      results,
      executionOrder
    });

  } catch (error) {
    console.error("Error executing workflow:", error);
    res.status(500).json({
      success: false,
      error: "Failed to execute workflow",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper: Build AI prompt from node data
 */
const buildAIPrompt = (node, input, workflowContext) => {
  let prompt = '';

  // Add the agent's system prompt
  if (node.prompt) {
    prompt += `${node.prompt}\n\n`;
  }

  // Add context from previous node if available
  if (input) {
    prompt += `Previous step output:\n${typeof input === 'string' ? input : JSON.stringify(input, null, 2)}\n\n`;
  }

  // Add workflow context if available
  if (workflowContext) {
    prompt += `Context: You are step ${workflowContext.currentIndex + 1} of ${workflowContext.totalNodes} in this workflow.\n\n`;
  }

  // Add settings as context
  const settings = parseSettings(node.settings);
  if (settings && Object.keys(settings).length > 0) {
    prompt += `Configuration:\n${JSON.stringify(settings, null, 2)}\n\n`;
  }

  prompt += 'Please process the above and provide your output:';

  return prompt;
};

/**
 * Helper: Parse settings from string or array format
 */
const parseSettings = (settings) => {
  if (!settings) return {};

  try {
    // If it's a string, parse it
    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }

    // If it's an array of {key, value} objects, convert to object
    if (Array.isArray(settings)) {
      return settings.reduce((acc, item) => {
        if (item && item.key) {
          acc[item.key] = item.value;
        }
        return acc;
      }, {});
    }

    return settings;
  } catch {
    return {};
  }
};

/**
 * Helper: Map common agent name to executable identifier
 */
const getExecutableIdentifier = (name) => {
  // Convert name to kebab-case identifier
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');
};

/**
 * Helper: Topological sort to get execution order
 */
const getExecutionOrder = (nodes, edges) => {
  const nodeIds = nodes.map(n => n.id || n.nodeId);
  const inDegree = {};
  const adjacencyList = {};

  // Initialize
  nodeIds.forEach(id => {
    inDegree[id] = 0;
    adjacencyList[id] = [];
  });

  // Build adjacency list and count in-degrees
  edges.forEach(edge => {
    const source = edge.source || edge.from;
    const target = edge.target || edge.to;

    if (adjacencyList[source]) {
      adjacencyList[source].push(target);
      inDegree[target] = (inDegree[target] || 0) + 1;
    }
  });

  // Find nodes with no incoming edges
  const queue = nodeIds.filter(id => inDegree[id] === 0);
  const result = [];

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    adjacencyList[current].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result;
};
