import dotenv from "dotenv";
import db from "../utils/prisma.js";
import { generateResponse } from "../services/ollamaService.js";

dotenv.config();

// Sample planning JSON to return for now
const getSamplePlanningSteps = (enhancedText) => {
  return {
    projectTitle: "Enhanced Project Planning",
    overview: "Based on the enhanced requirements, here's a comprehensive project plan with detailed steps and substeps.",
    estimatedDuration: "3-6 months",
    steps: [
      {
        id: "step-1",
        title: "Project Setup & Environment Configuration",
        description: "Initialize the project structure and set up development environment",
        estimatedTime: "1-2 weeks",
        priority: "High",
        substeps: [
          {
            id: "substep-1-1",
            title: "Initialize Git Repository",
            description: "Create repository structure with proper branching strategy",
            estimatedTime: "1 day",
            assignee: "DevOps Engineer",
            status: "pending"
          },
          {
            id: "substep-1-2",
            title: "Setup Development Environment",
            description: "Configure Node.js, React, and database environments",
            estimatedTime: "2-3 days",
            assignee: "Lead Developer",
            status: "pending"
          },
          {
            id: "substep-1-3",
            title: "Project Structure & Dependencies",
            description: "Set up folder structure and install required packages",
            estimatedTime: "2 days",
            assignee: "Frontend Developer",
            status: "pending"
          }
        ]
      },
      {
        id: "step-2",
        title: "Database Design & Backend Architecture",
        description: "Design database schema and implement backend services",
        estimatedTime: "2-3 weeks",
        priority: "High",
        substeps: [
          {
            id: "substep-2-1",
            title: "Database Schema Design",
            description: "Create ERD and design database tables with relationships",
            estimatedTime: "3-4 days",
            assignee: "Database Architect",
            status: "pending"
          },
          {
            id: "substep-2-2",
            title: "API Endpoints Design",
            description: "Define RESTful API endpoints and documentation",
            estimatedTime: "2-3 days",
            assignee: "Backend Developer",
            status: "pending"
          },
          {
            id: "substep-2-3",
            title: "Authentication System",
            description: "Implement JWT-based authentication and authorization",
            estimatedTime: "4-5 days",
            assignee: "Security Developer",
            status: "pending"
          },
          {
            id: "substep-2-4",
            title: "Core Business Logic",
            description: "Implement main application features and business rules",
            estimatedTime: "1-2 weeks",
            assignee: "Backend Developer",
            status: "pending"
          }
        ]
      },
      {
        id: "step-3",
        title: "Frontend Development & UI Implementation",
        description: "Build user interface and integrate with backend services",
        estimatedTime: "3-4 weeks",
        priority: "Medium",
        substeps: [
          {
            id: "substep-3-1",
            title: "UI/UX Design Implementation",
            description: "Convert designs into responsive React components",
            estimatedTime: "1-2 weeks",
            assignee: "Frontend Developer",
            status: "pending"
          },
          {
            id: "substep-3-2",
            title: "State Management Setup",
            description: "Implement Redux/Context API for state management",
            estimatedTime: "3-4 days",
            assignee: "Frontend Developer",
            status: "pending"
          },
          {
            id: "substep-3-3",
            title: "API Integration",
            description: "Connect frontend with backend APIs and handle data flow",
            estimatedTime: "1 week",
            assignee: "Full Stack Developer",
            status: "pending"
          },
          {
            id: "substep-3-4",
            title: "Form Validation & Error Handling",
            description: "Implement client-side validation and error management",
            estimatedTime: "2-3 days",
            assignee: "Frontend Developer",
            status: "pending"
          }
        ]
      },
      {
        id: "step-4",
        title: "Testing & Quality Assurance",
        description: "Comprehensive testing of all application features",
        estimatedTime: "2-3 weeks",
        priority: "High",
        substeps: [
          {
            id: "substep-4-1",
            title: "Unit Testing",
            description: "Write and execute unit tests for components and functions",
            estimatedTime: "1 week",
            assignee: "QA Engineer",
            status: "pending"
          },
          {
            id: "substep-4-2",
            title: "Integration Testing",
            description: "Test API integrations and data flow between components",
            estimatedTime: "4-5 days",
            assignee: "QA Engineer",
            status: "pending"
          },
          {
            id: "substep-4-3",
            title: "User Acceptance Testing",
            description: "End-to-end testing with stakeholders and users",
            estimatedTime: "3-4 days",
            assignee: "Product Manager",
            status: "pending"
          },
          {
            id: "substep-4-4",
            title: "Performance Testing",
            description: "Load testing and performance optimization",
            estimatedTime: "2-3 days",
            assignee: "DevOps Engineer",
            status: "pending"
          }
        ]
      },
      {
        id: "step-5",
        title: "Deployment & Launch",
        description: "Deploy application to production and go-live activities",
        estimatedTime: "1-2 weeks",
        priority: "High",
        substeps: [
          {
            id: "substep-5-1",
            title: "Production Environment Setup",
            description: "Configure production servers and database",
            estimatedTime: "2-3 days",
            assignee: "DevOps Engineer",
            status: "pending"
          },
          {
            id: "substep-5-2",
            title: "CI/CD Pipeline",
            description: "Setup automated deployment pipeline",
            estimatedTime: "3-4 days",
            assignee: "DevOps Engineer",
            status: "pending"
          },
          {
            id: "substep-5-3",
            title: "Production Deployment",
            description: "Deploy application to production environment",
            estimatedTime: "1-2 days",
            assignee: "Lead Developer",
            status: "pending"
          },
          {
            id: "substep-5-4",
            title: "Post-Launch Monitoring",
            description: "Monitor application performance and user feedback",
            estimatedTime: "1 week",
            assignee: "Support Team",
            status: "pending"
          }
        ]
      }
    ],
    resources: [
      "Lead Developer",
      "Frontend Developer",
      "Backend Developer",
      "Database Architect",
      "DevOps Engineer",
      "QA Engineer",
      "Product Manager",
      "Security Developer"
    ],
    technologies: [
      "React.js",
      "Node.js",
      "Express.js",
      "PostgreSQL/MongoDB",
      "JWT Authentication",
      "Docker",
      "AWS/GCP"
    ]
  };
};

export const generateInitialPlanning = async (req, res) => {
  try {
    const { enhancedText, requirementId } = req.body;
    const userId = req.user?.id;

    if (!enhancedText) {
      return res.status(400).json({
        error: "Enhanced text is required for planning generation",
        success: false
      });
    }

    // TODO: Construct the prompt for Ollama (commented out for now)
    // const prompt = `
    // You are a project planning assistant. Based on the following enhanced project requirements,
    // create a detailed project plan with steps and substeps in JSON format.
    //
    // Enhanced Requirements:
    // ${enhancedText}
    //
    // Please return a JSON object with the following structure:
    // {
    //   "projectTitle": "string",
    //   "overview": "string",
    //   "estimatedDuration": "string",
    //   "steps": [
    //     {
    //       "id": "step-1",
    //       "title": "string",
    //       "description": "string",
    //       "estimatedTime": "string",
    //       "priority": "High|Medium|Low",
    //       "substeps": [
    //         {
    //           "id": "substep-1-1",
    //           "title": "string",
    //           "description": "string",
    //           "estimatedTime": "string",
    //           "assignee": "string",
    //           "status": "pending"
    //         }
    //       ]
    //     }
    //   ],
    //   "resources": ["string"],
    //   "technologies": ["string"]
    // }
    //
    // Make sure the response is valid JSON only.
    // `;

    console.log('='.repeat(80));
    console.log('GENERATING INITIAL PLANNING (MOCK MODE):');
    console.log('='.repeat(80));
    console.log('Enhanced Text:', enhancedText);
    console.log('='.repeat(80));

    try {
      // TODO: Enable Ollama integration by uncommenting the code below
      // const aiResponse = await generateResponse(prompt);
      // const planningData = JSON.parse(aiResponse.trim());

      // Mock planning data for now
      const planningData = getSamplePlanningSteps(enhancedText);

      console.log('Generated Planning Data:', JSON.stringify(planningData, null, 2));
      console.log('='.repeat(80));

      // Update database if user is authenticated
      if (userId && requirementId) {
        try {
          // You might want to create a Planning table or update the Requirement record
          await db.requirement.update({
            where: { id: parseInt(requirementId) },
            data: {
              outputText: JSON.stringify(planningData),
              status: 'PLANNING_GENERATED',
              responseTime: new Date()
            }
          });
          console.log(`Updated requirement record ${requirementId} with planning data`);
        } catch (dbError) {
          console.error('Database update error:', dbError);
          // Continue without failing the request
        }
      }

      res.status(200).json({
        success: true,
        message: "Initial planning generated successfully",
        planningData,
        enhancedText: enhancedText,
        requirementId: requirementId
      });

    } catch (ollamaError) {
      console.error('Ollama API error:', ollamaError);
      res.status(500).json({
        error: "Failed to generate planning with AI",
        success: false,
        details: process.env.NODE_ENV === 'development' ? ollamaError.message : undefined
      });
    }

  } catch (error) {
    console.error("Error generating initial planning:", error);
    res.status(500).json({
      error: "Internal server error while generating planning",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};