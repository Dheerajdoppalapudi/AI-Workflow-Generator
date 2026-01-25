import db from "../utils/prisma.js";

// Initialize default teams and agents (for development/setup)
export const initializeTeamsAndAgents = async (req, res) => {
  try {
    // Check for force parameter to reinitialize
    const forceReinit = req.query?.force === 'true';

    // Check if teams already exist
    const existingTeams = await db.team.count();
    if (existingTeams > 0 && !forceReinit) {
      return res.status(200).json({
        success: true,
        message: "Teams and agents already initialized. Use ?force=true to reinitialize."
      });
    }

    // If force reinit, delete existing teams and agents first
    if (forceReinit && existingTeams > 0) {
      await db.agent.deleteMany({});
      await db.team.deleteMany({});
      console.log('Deleted existing teams and agents for reinitialization');
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

// Initialize common agents (seed data)
export const initializeCommonAgents = async (req, res) => {
  try {
    // Check for force parameter to reinitialize
    const forceReinit = req.query?.force === 'true';

    // Check if common agents already exist
    const existingCommonAgents = await db.commonAgent.count();
    if (existingCommonAgents > 0 && !forceReinit) {
      return res.status(200).json({
        success: true,
        message: "Common agents already initialized. Use ?force=true to reinitialize."
      });
    }

    // If force reinit, delete existing common agents first
    if (forceReinit && existingCommonAgents > 0) {
      await db.commonAgent.deleteMany({});
      console.log('Deleted existing common agents for reinitialization');
    }

    // Create default common agents
    const commonAgentsData = [
      // Communication
      {
        name: "Email Sender",
        description: "Send emails with attachments and custom templates",
        prompt: "You are an email automation agent. Help users compose and send professional emails. Handle email templates, attachments, and recipient management. Ensure proper email formatting and deliverability best practices.",
        category: "Communication",
        icon: "MailOutlined",
        settings: JSON.stringify([
          { key: "from", value: "", required: true },
          { key: "to", value: "", required: true },
          { key: "subject", value: "", required: false },
          { key: "smtp_host", value: "", required: false }
        ])
      },
      {
        name: "Slack Notifier",
        description: "Send notifications and messages to Slack channels",
        prompt: "You are a Slack integration agent. Help users send messages, notifications, and alerts to Slack channels and users. Support rich formatting, attachments, and interactive messages.",
        category: "Communication",
        icon: "MessageOutlined",
        settings: JSON.stringify([
          { key: "webhook_url", value: "", required: true },
          { key: "channel", value: "", required: false }
        ])
      },
      {
        name: "SMS Sender",
        description: "Send SMS text messages via various providers",
        prompt: "You are an SMS automation agent. Help users send text messages programmatically. Handle phone number validation, message length optimization, and delivery status tracking.",
        category: "Communication",
        icon: "MobileOutlined",
        settings: JSON.stringify([
          { key: "phone_number", value: "", required: true },
          { key: "provider_api_key", value: "", required: true }
        ])
      },
      // File Conversion
      {
        name: "PDF Converter",
        description: "Convert various file formats to PDF",
        prompt: "You are a PDF conversion agent. Convert documents, images, and other file formats to PDF. Ensure proper formatting, compression, and quality settings. Handle batch conversions and maintain document fidelity.",
        category: "File Conversion",
        icon: "FilePdfOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input File", value: "", required: true, type: "file" },
          { key: "outputFile", label: "Output PDF File Path", value: "", required: false, type: "string" },
          { key: "quality", label: "Quality", value: "high", required: false, type: "select", options: ["low", "medium", "high"] }
        ])
      },
      {
        name: "Word to PDF",
        description: "Convert Microsoft Word documents to PDF format",
        prompt: "You are a Word to PDF conversion agent. Convert .doc and .docx files to PDF format while preserving formatting, fonts, images, and layout. Handle headers, footers, and page numbering correctly.",
        category: "File Conversion",
        icon: "FileWordOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input Word File", value: "", required: true, type: "file", accept: ".doc,.docx" },
          { key: "outputFile", label: "Output PDF File Path", value: "", required: false, type: "string" }
        ])
      },
      {
        name: "Excel to CSV",
        description: "Convert Excel spreadsheets to CSV format",
        prompt: "You are an Excel to CSV conversion agent. Convert .xlsx and .xls files to CSV format. Handle multiple sheets, data formatting, and special characters. Ensure data integrity during conversion.",
        category: "File Conversion",
        icon: "FileExcelOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input Excel File", value: "", required: true, type: "file", accept: ".xlsx,.xls" },
          { key: "outputFile", label: "Output CSV File Path", value: "", required: false, type: "string" },
          { key: "sheetName", label: "Sheet Name", value: "", required: false, type: "string", placeholder: "Leave empty for first sheet" },
          { key: "delimiter", label: "Delimiter", value: ",", required: false, type: "string", placeholder: "Default: comma (,)" }
        ])
      },
      {
        name: "Image Converter",
        description: "Convert images between different formats (PNG, JPG, WebP, etc.)",
        prompt: "You are an image conversion agent. Convert images between formats like PNG, JPG, WebP, GIF, and BMP. Handle compression, quality settings, resizing, and batch processing.",
        category: "File Conversion",
        icon: "FileImageOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input Image", value: "", required: true, type: "file", accept: ".png,.jpg,.jpeg,.webp,.gif,.bmp" },
          { key: "outputFormat", label: "Output Format", value: "png", required: true, type: "select", options: ["png", "jpg", "webp", "gif", "bmp"] },
          { key: "outputFile", label: "Output File Path", value: "", required: false, type: "string" },
          { key: "quality", label: "Quality (1-100)", value: "85", required: false, type: "number" }
        ])
      },
      // Data Processing
      {
        name: "Data Validator",
        description: "Validate and clean data against defined rules",
        prompt: "You are a data validation agent. Validate data against schema definitions, business rules, and format requirements. Identify and report errors, suggest corrections, and clean malformed data.",
        category: "Data Processing",
        icon: "CheckCircleOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input Data File", value: "", required: true, type: "file" },
          { key: "schemaFile", label: "Schema File (optional)", value: "", required: false, type: "file" },
          { key: "rules", label: "Validation Rules (JSON)", value: "", required: false, type: "textarea" }
        ])
      },
      {
        name: "JSON Transformer",
        description: "Transform and manipulate JSON data structures",
        prompt: "You are a JSON transformation agent. Parse, transform, and restructure JSON data. Handle mapping between different schemas, filtering, aggregation, and format conversion.",
        category: "Data Processing",
        icon: "CodeOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input JSON File", value: "", required: true, type: "file", accept: ".json" },
          { key: "outputFile", label: "Output File Path", value: "", required: false, type: "string" },
          { key: "transformation", label: "Transformation Rules (JSONPath/JMESPath)", value: "", required: false, type: "textarea" }
        ])
      },
      {
        name: "CSV Parser",
        description: "Parse and process CSV files with various delimiters",
        prompt: "You are a CSV parsing agent. Read and process CSV files with different delimiters, encodings, and formats. Handle headers, data types, and large file processing efficiently.",
        category: "Data Processing",
        icon: "TableOutlined",
        settings: JSON.stringify([
          { key: "inputFile", label: "Input CSV File", value: "", required: true, type: "file", accept: ".csv" },
          { key: "delimiter", label: "Delimiter", value: ",", required: false, type: "string" },
          { key: "hasHeader", label: "Has Header Row", value: "true", required: false, type: "boolean" },
          { key: "encoding", label: "File Encoding", value: "utf-8", required: false, type: "select", options: ["utf-8", "ascii", "latin1", "utf-16"] }
        ])
      },
      // Web & API
      {
        name: "API Caller",
        description: "Make HTTP requests to external APIs",
        prompt: "You are an API integration agent. Make HTTP requests (GET, POST, PUT, DELETE) to external APIs. Handle authentication, headers, request/response formatting, and error handling.",
        category: "Web & API",
        icon: "ApiOutlined",
        settings: JSON.stringify([
          { key: "endpoint_url", value: "", required: true },
          { key: "api_key", value: "", required: false },
          { key: "method", value: "GET", required: false }
        ])
      },
      {
        name: "Web Scraper",
        description: "Extract data from web pages",
        prompt: "You are a web scraping agent. Extract structured data from web pages. Handle HTML parsing, dynamic content, pagination, and rate limiting. Respect robots.txt and implement ethical scraping practices.",
        category: "Web & API",
        icon: "GlobalOutlined",
        settings: JSON.stringify([
          { key: "target_url", value: "", required: true }
        ])
      },
      // Storage & Database
      {
        name: "File Uploader",
        description: "Upload files to cloud storage services",
        prompt: "You are a file upload agent. Upload files to cloud storage services like S3, Google Cloud Storage, or Azure Blob. Handle large files, multipart uploads, and access permissions.",
        category: "Storage & Database",
        icon: "CloudUploadOutlined",
        settings: JSON.stringify([
          { key: "path", value: "", required: true },
          { key: "bucket", value: "", required: false },
          { key: "access_key", value: "", required: false }
        ])
      },
      {
        name: "Database Query",
        description: "Execute database queries and retrieve data",
        prompt: "You are a database query agent. Execute SQL queries safely against databases. Handle parameterized queries, result formatting, and pagination. Support common databases like PostgreSQL, MySQL, and SQLite.",
        category: "Storage & Database",
        icon: "DatabaseOutlined",
        settings: JSON.stringify([
          { key: "connection_string", value: "", required: true },
          { key: "database", value: "", required: false }
        ])
      },
      // Utilities
      {
        name: "Text Summarizer",
        description: "Summarize long text content into key points",
        prompt: "You are a text summarization agent. Analyze and summarize long documents, articles, or text content. Extract key points, maintain context, and provide concise summaries at various detail levels.",
        category: "Utilities",
        icon: "FileTextOutlined",
        settings: JSON.stringify([
          { key: "inputText", label: "Text to Summarize", value: "", required: true, type: "textarea" },
          { key: "maxLength", label: "Max Summary Length (words)", value: "100", required: false, type: "number" },
          { key: "style", label: "Summary Style", value: "bullet", required: false, type: "select", options: ["bullet", "paragraph", "key-points"] }
        ])
      },
      {
        name: "Language Translator",
        description: "Translate text between different languages",
        prompt: "You are a translation agent. Translate text between languages accurately while preserving meaning, tone, and context. Handle technical terms, idioms, and cultural nuances.",
        category: "Utilities",
        icon: "TranslationOutlined",
        settings: JSON.stringify([
          { key: "inputText", label: "Text to Translate", value: "", required: true, type: "textarea" },
          { key: "sourceLanguage", label: "Source Language", value: "auto", required: false, type: "string", placeholder: "auto-detect" },
          { key: "targetLanguage", label: "Target Language", value: "", required: true, type: "string", placeholder: "e.g., Spanish, French" }
        ])
      },
      {
        name: "Report Generator",
        description: "Generate formatted reports from data",
        prompt: "You are a report generation agent. Create formatted reports from raw data. Support multiple output formats (PDF, HTML, Markdown), charts, tables, and custom templates.",
        category: "Utilities",
        icon: "BarChartOutlined",
        settings: JSON.stringify([
          { key: "inputData", label: "Input Data (JSON)", value: "", required: true, type: "textarea" },
          { key: "outputFormat", label: "Output Format", value: "markdown", required: false, type: "select", options: ["pdf", "html", "markdown"] },
          { key: "templateName", label: "Report Template", value: "default", required: false, type: "string" }
        ])
      },
      {
        name: "Scheduler",
        description: "Schedule and manage timed tasks",
        prompt: "You are a scheduling agent. Manage scheduled tasks, cron jobs, and timed executions. Handle timezone conversions, recurring schedules, and execution logging.",
        category: "Utilities",
        icon: "ClockCircleOutlined",
        settings: JSON.stringify([
          { key: "cronExpression", label: "Cron Expression", value: "", required: true, type: "string", placeholder: "e.g., 0 9 * * MON-FRI" },
          { key: "timezone", label: "Timezone", value: "UTC", required: false, type: "string" },
          { key: "taskDescription", label: "Task Description", value: "", required: false, type: "textarea" }
        ])
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
