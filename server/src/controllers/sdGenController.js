import dotenv from "dotenv";
import db from "../utils/prisma.js";
import axios from "axios";

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

// Initialize default teams and agents (for development/setup)
export const initializeTeamsAndAgents = async (_req, res) => {
  try {
    // Check if teams already exist
    const existingTeams = await db.team.count();
    if (existingTeams > 0) {
      return res.status(200).json({
        success: true,
        message: "Teams and agents already initialized"
      });
    }

    // Create default teams with agents
    const teamsData = [
      {
        name: "Seals Python Automation",
        description: "Python-based automation and development team",
        agents: [
          {
            name: "Requirement Analysis",
            description: "Analyze and document project requirements",
            prompt: "You are a requirements analyst for Python automation projects. Analyze the given requirements and provide detailed specifications, considering automation opportunities and Python best practices.",
            icon: "FileTextOutlined",
          },
          {
            name: "Planning Agent",
            description: "Create project structure and roadmap",
            prompt: "You are a project planning specialist for Python automation. Create a detailed project structure, technology stack recommendations, and implementation roadmap.",
            icon: "ProjectOutlined",
          },
          {
            name: "Design Agent",
            description: "Generate system architecture and UI design",
            prompt: "You are a system architect for Python automation solutions. Design the system architecture, data flow, and component interactions.",
            icon: "SketchOutlined",
          },
          {
            name: "Development Agent",
            description: "Write and implement Python code",
            prompt: "You are a senior Python developer specialized in automation. Write clean, efficient, and well-documented Python code following PEP 8 standards.",
            icon: "CodeOutlined",
          },
          {
            name: "Testing Agent",
            description: "Execute comprehensive testing procedures",
            prompt: "You are a QA engineer for Python automation. Create comprehensive test plans, write unit tests, and ensure code quality.",
            icon: "BugOutlined",
          },
          {
            name: "CI/CD Agent",
            description: "Deploy and configure continuous integration",
            prompt: "You are a DevOps engineer for Python automation. Set up CI/CD pipelines, containerization, and deployment strategies.",
            icon: "RocketOutlined",
          }
        ]
      },
      {
        name: "GD Simplification Macro",
        description: "General development simplification and macro automation team",
        agents: [
          {
            name: "Requirement Analysis",
            description: "Analyze and document project requirements",
            prompt: "You are a requirements analyst focused on simplification. Analyze requirements and identify opportunities to simplify and automate workflows.",
            icon: "FileTextOutlined",
          },
          {
            name: "Planning Agent",
            description: "Create simplified project structure",
            prompt: "You are a planning specialist focused on simplicity. Design minimal, efficient project structures that are easy to maintain.",
            icon: "ProjectOutlined",
          },
          {
            name: "Design Agent",
            description: "Generate simplified system design",
            prompt: "You are a system architect focused on simplification. Create streamlined designs that reduce complexity while maintaining functionality.",
            icon: "SketchOutlined",
          },
          {
            name: "Development Agent",
            description: "Write and implement simplified code",
            prompt: "You are a developer focused on code simplicity. Write clean, minimal code that is easy to understand and maintain.",
            icon: "CodeOutlined",
          },
          {
            name: "Testing Agent",
            description: "Execute streamlined testing",
            prompt: "You are a QA engineer focused on efficient testing. Create focused test plans that maximize coverage with minimal effort.",
            icon: "BugOutlined",
          },
          {
            name: "CI/CD Agent",
            description: "Automated deployment pipeline",
            prompt: "You are a DevOps engineer focused on automation. Set up simple, automated deployment pipelines with minimal configuration.",
            icon: "RocketOutlined",
          }
        ]
      },
      {
        name: "Web Development Team",
        description: "Full-stack web development specialists",
        agents: [
          {
            name: "Requirement Analysis",
            description: "Analyze web application requirements",
            prompt: "You are a requirements analyst for web applications. Analyze requirements and define user stories, features, and technical specifications for web projects.",
            icon: "FileTextOutlined",
          },
          {
            name: "Planning Agent",
            description: "Plan web application architecture",
            prompt: "You are a web application architect. Plan the technology stack, database schema, API structure, and frontend architecture.",
            icon: "ProjectOutlined",
          },
          {
            name: "Design Agent",
            description: "Create UI/UX designs and wireframes",
            prompt: "You are a UI/UX designer for web applications. Create wireframes, design systems, and user interface specifications.",
            icon: "SketchOutlined",
          },
          {
            name: "Development Agent",
            description: "Develop frontend and backend code",
            prompt: "You are a full-stack web developer. Write both frontend and backend code, implement APIs, and integrate components.",
            icon: "CodeOutlined",
          },
          {
            name: "Testing Agent",
            description: "Perform web application testing",
            prompt: "You are a QA engineer for web applications. Create test plans covering unit tests, integration tests, and end-to-end testing.",
            icon: "BugOutlined",
          },
          {
            name: "CI/CD Agent",
            description: "Deploy web applications",
            prompt: "You are a DevOps engineer for web applications. Set up deployment pipelines, hosting infrastructure, and monitoring systems.",
            icon: "RocketOutlined",
          }
        ]
      }
    ];

    for (const teamData of teamsData) {
      const team = await db.team.create({
        data: {
          name: teamData.name,
          description: teamData.description
        }
      });

      for (const agentData of teamData.agents) {
        await db.agent.create({
          data: {
            name: agentData.name,
            description: agentData.description,
            prompt: agentData.prompt,
            icon: agentData.icon,
            teamId: team.id
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Teams and agents initialized successfully",
      teamsCreated: teamsData.length
    });

  } catch (error) {
    console.error("Error initializing teams and agents:", error);
    res.status(500).json({
      error: "Internal server error while initializing teams and agents",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Initialize common agents (seed data)
export const initializeCommonAgents = async (_req, res) => {
  try {
    // Check if common agents already exist
    const existingCommonAgents = await db.commonAgent.count();
    if (existingCommonAgents > 0) {
      return res.status(200).json({
        success: true,
        message: "Common agents already initialized"
      });
    }

    // Create default common agents
    const commonAgentsData = [
      // Communication
      {
        name: "Email Sender",
        description: "Send emails with attachments and custom templates",
        prompt: "You are an email automation agent. Help users compose and send professional emails. Handle email templates, attachments, and recipient management. Ensure proper email formatting and deliverability best practices.",
        category: "Communication",
        icon: "MailOutlined"
      },
      {
        name: "Slack Notifier",
        description: "Send notifications and messages to Slack channels",
        prompt: "You are a Slack integration agent. Help users send messages, notifications, and alerts to Slack channels and users. Support rich formatting, attachments, and interactive messages.",
        category: "Communication",
        icon: "MessageOutlined"
      },
      {
        name: "SMS Sender",
        description: "Send SMS text messages via various providers",
        prompt: "You are an SMS automation agent. Help users send text messages programmatically. Handle phone number validation, message length optimization, and delivery status tracking.",
        category: "Communication",
        icon: "MobileOutlined"
      },
      // File Conversion
      {
        name: "PDF Converter",
        description: "Convert various file formats to PDF",
        prompt: "You are a PDF conversion agent. Convert documents, images, and other file formats to PDF. Ensure proper formatting, compression, and quality settings. Handle batch conversions and maintain document fidelity.",
        category: "File Conversion",
        icon: "FilePdfOutlined"
      },
      {
        name: "Word to PDF",
        description: "Convert Microsoft Word documents to PDF format",
        prompt: "You are a Word to PDF conversion agent. Convert .doc and .docx files to PDF format while preserving formatting, fonts, images, and layout. Handle headers, footers, and page numbering correctly.",
        category: "File Conversion",
        icon: "FileWordOutlined"
      },
      {
        name: "Excel to CSV",
        description: "Convert Excel spreadsheets to CSV format",
        prompt: "You are an Excel to CSV conversion agent. Convert .xlsx and .xls files to CSV format. Handle multiple sheets, data formatting, and special characters. Ensure data integrity during conversion.",
        category: "File Conversion",
        icon: "FileExcelOutlined"
      },
      {
        name: "Image Converter",
        description: "Convert images between different formats (PNG, JPG, WebP, etc.)",
        prompt: "You are an image conversion agent. Convert images between formats like PNG, JPG, WebP, GIF, and BMP. Handle compression, quality settings, resizing, and batch processing.",
        category: "File Conversion",
        icon: "FileImageOutlined"
      },
      // Data Processing
      {
        name: "Data Validator",
        description: "Validate and clean data against defined rules",
        prompt: "You are a data validation agent. Validate data against schema definitions, business rules, and format requirements. Identify and report errors, suggest corrections, and clean malformed data.",
        category: "Data Processing",
        icon: "CheckCircleOutlined"
      },
      {
        name: "JSON Transformer",
        description: "Transform and manipulate JSON data structures",
        prompt: "You are a JSON transformation agent. Parse, transform, and restructure JSON data. Handle mapping between different schemas, filtering, aggregation, and format conversion.",
        category: "Data Processing",
        icon: "CodeOutlined"
      },
      {
        name: "CSV Parser",
        description: "Parse and process CSV files with various delimiters",
        prompt: "You are a CSV parsing agent. Read and process CSV files with different delimiters, encodings, and formats. Handle headers, data types, and large file processing efficiently.",
        category: "Data Processing",
        icon: "TableOutlined"
      },
      // Web & API
      {
        name: "API Caller",
        description: "Make HTTP requests to external APIs",
        prompt: "You are an API integration agent. Make HTTP requests (GET, POST, PUT, DELETE) to external APIs. Handle authentication, headers, request/response formatting, and error handling.",
        category: "Web & API",
        icon: "ApiOutlined"
      },
      {
        name: "Web Scraper",
        description: "Extract data from web pages",
        prompt: "You are a web scraping agent. Extract structured data from web pages. Handle HTML parsing, dynamic content, pagination, and rate limiting. Respect robots.txt and implement ethical scraping practices.",
        category: "Web & API",
        icon: "GlobalOutlined"
      },
      // Storage & Database
      {
        name: "File Uploader",
        description: "Upload files to cloud storage services",
        prompt: "You are a file upload agent. Upload files to cloud storage services like S3, Google Cloud Storage, or Azure Blob. Handle large files, multipart uploads, and access permissions.",
        category: "Storage & Database",
        icon: "CloudUploadOutlined"
      },
      {
        name: "Database Query",
        description: "Execute database queries and retrieve data",
        prompt: "You are a database query agent. Execute SQL queries safely against databases. Handle parameterized queries, result formatting, and pagination. Support common databases like PostgreSQL, MySQL, and SQLite.",
        category: "Storage & Database",
        icon: "DatabaseOutlined"
      },
      // Utilities
      {
        name: "Text Summarizer",
        description: "Summarize long text content into key points",
        prompt: "You are a text summarization agent. Analyze and summarize long documents, articles, or text content. Extract key points, maintain context, and provide concise summaries at various detail levels.",
        category: "Utilities",
        icon: "FileTextOutlined"
      },
      {
        name: "Language Translator",
        description: "Translate text between different languages",
        prompt: "You are a translation agent. Translate text between languages accurately while preserving meaning, tone, and context. Handle technical terms, idioms, and cultural nuances.",
        category: "Utilities",
        icon: "TranslationOutlined"
      },
      {
        name: "Report Generator",
        description: "Generate formatted reports from data",
        prompt: "You are a report generation agent. Create formatted reports from raw data. Support multiple output formats (PDF, HTML, Markdown), charts, tables, and custom templates.",
        category: "Utilities",
        icon: "BarChartOutlined"
      },
      {
        name: "Scheduler",
        description: "Schedule and manage timed tasks",
        prompt: "You are a scheduling agent. Manage scheduled tasks, cron jobs, and timed executions. Handle timezone conversions, recurring schedules, and execution logging.",
        category: "Utilities",
        icon: "ClockCircleOutlined"
      }
    ];

    for (const agentData of commonAgentsData) {
      await db.commonAgent.create({
        data: agentData
      });
    }

    res.status(200).json({
      success: true,
      message: "Common agents initialized successfully",
      agentsCreated: commonAgentsData.length
    });

  } catch (error) {
    console.error("Error initializing common agents:", error);
    res.status(500).json({
      error: "Internal server error while initializing common agents",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Call Ollama API
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1:latest",
        prompt: engineeredPrompt,
        stream: false
      },
      {
        timeout: 120000 // 2 minute timeout
      }
    );

    console.log('Ollama response received');

    const aiResponse = ollamaResponse.data.response;
    console.log('AI Response:', aiResponse);

    // Extract JSON from the response
    let workflowJson;
    try {
      // Try to find JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        workflowJson = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, try parsing the whole response
        workflowJson = JSON.parse(aiResponse);
      }

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
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: "Unable to connect to Ollama. Please ensure Ollama is running on localhost:11434",
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