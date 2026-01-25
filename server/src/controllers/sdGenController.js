import dotenv from "dotenv";
import db from "../utils/prisma.js";
import { generateResponse, extractJsonFromResponse } from "../services/ollamaService.js";

dotenv.config();

// Get all teams
export const getTeams = async (_req, res) => {
  try {
    const teams = await db.team.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      teams
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      error: "Internal server error while fetching teams",
      success: false
    });
  }
};

// Get all agents
export const getAllAgents = async (_req, res) => {
  try {
    const agents = await db.agent.findMany({
      orderBy: [
        { teamId: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      agents
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({
      error: "Internal server error while fetching agents",
      success: false
    });
  }
};

// Get agents by team ID
export const getAgentsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId || isNaN(parseInt(teamId))) {
      return res.status(400).json({
        error: "Valid team ID is required",
        success: false
      });
    }

    const agents = await db.agent.findMany({
      where: {
        teamId: parseInt(teamId)
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      agents
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({
      error: "Internal server error while fetching agents",
      success: false
    });
  }
};

// Create a new agent
export const createAgent = async (req, res) => {
  try {
    const { name, description, prompt, settings, icon, teamId } = req.body;

    if (!name || !teamId) {
      return res.status(400).json({
        error: "Agent name and team ID are required",
        success: false
      });
    }

    // Check if agent with same name exists in this team
    const existingAgent = await db.agent.findFirst({
      where: {
        name,
        teamId: parseInt(teamId)
      }
    });

    if (existingAgent) {
      return res.status(400).json({
        error: "An agent with this name already exists in the selected team",
        success: false
      });
    }

    const agent = await db.agent.create({
      data: {
        name,
        description,
        prompt,
        settings: settings ? JSON.stringify(settings) : null,
        icon,
        teamId: parseInt(teamId)
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      agent
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({
      error: "Internal server error while creating agent",
      success: false
    });
  }
};

// Update an existing agent
export const updateAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { name, description, prompt, settings, icon } = req.body;

    if (!agentId || isNaN(parseInt(agentId))) {
      return res.status(400).json({
        error: "Valid agent ID is required",
        success: false
      });
    }

    const agent = await db.agent.update({
      where: {
        id: parseInt(agentId)
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(prompt !== undefined && { prompt }),
        ...(settings !== undefined && { settings: settings ? JSON.stringify(settings) : null }),
        ...(icon !== undefined && { icon })
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      agent
    });
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({
      error: "Internal server error while updating agent",
      success: false
    });
  }
};

// Delete an agent
export const deleteAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId || isNaN(parseInt(agentId))) {
      return res.status(400).json({
        error: "Valid agent ID is required",
        success: false
      });
    }

    await db.agent.delete({
      where: {
        id: parseInt(agentId)
      }
    });

    res.status(200).json({
      success: true,
      message: "Agent deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({
      error: "Internal server error while deleting agent",
      success: false
    });
  }
};

// Get all common agents
export const getCommonAgents = async (_req, res) => {
  try {
    const commonAgents = await db.commonAgent.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      commonAgents
    });
  } catch (error) {
    console.error("Error fetching common agents:", error);
    res.status(500).json({
      error: "Internal server error while fetching common agents",
      success: false
    });
  }
};

// Generate workflow using AI
export const generateWorkflow = async (req, res) => {
  try {
    const { userPrompt, teamId } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        error: "User prompt is required",
        success: false
      });
    }

    // Get team agents if teamId is provided
    let teamAgents = [];
    let teamName = "";
    if (teamId) {
      const agents = await db.agent.findMany({
        where: {
          teamId: parseInt(teamId)
        },
        include: {
          team: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      teamAgents = agents.map(agent => ({
        name: agent.name,
        description: agent.description,
        prompt: agent.prompt,
        icon: agent.icon
      }));

      if (agents.length > 0) {
        teamName = agents[0].team.name;
      }
    }

    // Build the engineered prompt for Ollama
    const engineeredPrompt = `You are a workflow design assistant. Based on the user's description, generate a workflow JSON structure.

${teamId ? `The user has selected the team: "${teamName}"` : 'No specific team selected.'}

${teamAgents.length > 0 ? `Available agents in this team:
${teamAgents.map((agent, idx) => `${idx + 1}. ${agent.name} - ${agent.description}`).join('\n')}
` : ''}

User's Request: "${userPrompt}"

Generate a JSON workflow structure with the following format:
{
  "teamId": ${teamId || 'null'},
  "agents": [
    {
      "id": "agent-unique-id",
      "name": "Agent Name",
      "description": "What this agent does",
      "prompt": "Detailed prompt for the agent",
      "position": { "x": 150, "y": 150 },
      "order": 0
    }
  ],
  "connections": [
    {
      "from": "agent-id-1",
      "to": "agent-id-2"
    }
  ]
}

Important instructions:
1. Create agents that fulfill the user's workflow requirements
${teamAgents.length > 0 ? '2. Use the available team agents when appropriate, but you can also create new custom agents if needed' : '2. Create custom agents based on the workflow needs'}
3. Position agents horizontally with x spacing of 350 pixels (e.g., first at x:150, second at x:500, third at x:850)
4. All agents start at y:150
5. Create connections in sequence from the first agent to the last
6. Each agent should have a unique id in the format "agent-name-in-lowercase-with-dashes"
7. Provide detailed, actionable prompts for each agent
8. Return ONLY the JSON object, no additional text or explanation

Generate the workflow JSON now:`;

    console.log('Calling Ollama with prompt...');

    // Call Ollama API using centralized service
    const aiResponse = await generateResponse(engineeredPrompt);

    console.log('Ollama response received');
    console.log('AI Response:', aiResponse);

    // Extract JSON from the response
    let workflowJson;
    try {
      workflowJson = extractJsonFromResponse(aiResponse);

      // Validate the structure
      if (!workflowJson.agents || !Array.isArray(workflowJson.agents)) {
        throw new Error('Invalid workflow structure: missing agents array');
      }

      // Ensure teamId is set if provided
      if (teamId) {
        workflowJson.teamId = parseInt(teamId);
      }

      res.status(200).json({
        success: true,
        data: {
          workflowJson,
          aiResponse: aiResponse.substring(0, 500) // Return first 500 chars of AI response for debugging
        }
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      res.status(500).json({
        error: "Failed to parse AI-generated workflow JSON",
        success: false,
        aiResponse: aiResponse.substring(0, 500),
        details: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }

  } catch (error) {
    console.error("Error generating workflow:", error);

    // Check if it's an Ollama connection error
    if (error.code === 'OLLAMA_CONNECTION_ERROR') {
      return res.status(503).json({
        error: error.message,
        success: false
      });
    }

    // Check if it's a timeout error
    if (error.code === 'OLLAMA_TIMEOUT_ERROR') {
      return res.status(504).json({
        error: error.message,
        success: false
      });
    }

    res.status(500).json({
      error: "Internal server error while generating workflow",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};