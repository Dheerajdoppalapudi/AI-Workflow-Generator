import dotenv from "dotenv";
import db from "../utils/prisma.js";
import multer from 'multer';
import mammoth from 'mammoth';
import { generateResponse } from "../services/ollamaService.js";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT, PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

const extractTextFromFile = async (file) => {
  try {
    switch (file.mimetype) {
      case 'text/plain':
        return file.buffer.toString('utf-8');

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
        return docxResult.value;

      case 'application/msword':
        try {
          const docResult = await mammoth.extractRawText({ buffer: file.buffer });
          return docResult.value;
        } catch (docError) {
          throw new Error('Legacy DOC files are not fully supported. Please convert to DOCX format.');
        }

      case 'application/pdf':
        // For now, return a placeholder for PDF files
        // You might want to add a PDF parser library like pdf-parse
        throw new Error('PDF files are not yet supported. Please convert to TXT or DOCX format.');

      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to process file: ${file.originalname}`);
  }
};

const validateAndCleanText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Sample questions to return for now
const getSampleQuestions = () => {
  return [
    {
      id: 1,
      question: "What type of application are you building?",
      options: ["Web Application", "Mobile App (iOS/Android)", "Desktop Software", "API/Backend Service"],
      required: true
    },
    {
      id: 2,
      question: "Who is your target audience?",
      options: ["General Public", "Business Users", "Developers/Technical Users", "Internal Team Only"],
      required: true
    },
    {
      id: 3,
      question: "What is your preferred technology stack?",
      options: ["React/Node.js", "Python/Django", "Java/Spring", "PHP/Laravel", "No Preference"],
      required: false
    },
    {
      id: 4,
      question: "What is your estimated project timeline?",
      options: ["1-2 weeks", "1-3 months", "3-6 months", "6+ months"],
      required: true
    },
    {
      id: 5,
      question: "What is the expected scale/complexity of this project?",
      options: ["Simple/Small", "Medium Complexity", "Large/Complex", "Enterprise Level"],
      required: true
    }
  ];
};

export const processRequirements = async (req, res) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        error: err.message || "File upload error",
        success: false
      });
    }

    try {
      const { description, projectName, teamId } = req.body;
      const files = req.files || [];
      const userId = req.user?.id;

      let combinedText = validateAndCleanText(description) || '';
      const processedFiles = [];
      const failedFiles = [];

      // Process uploaded files
      if (files.length > 0) {
        console.log(`Processing ${files.length} files...`);

        for (const file of files) {
          try {
            const text = await extractTextFromFile(file);
            const cleanText = validateAndCleanText(text);

            if (cleanText) {
              combinedText += `\n\n--- Content from ${file.originalname} ---\n${cleanText}`;
              processedFiles.push({
                id: Date.now() + Math.random(), // Temporary ID for frontend
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                processed: true,
                uploadDate: new Date().toISOString()
              });
            } else {
              failedFiles.push({
                name: file.originalname,
                error: 'No readable content found'
              });
            }
          } catch (error) {
            console.error(`Error processing ${file.originalname}:`, error);
            failedFiles.push({
              name: file.originalname,
              error: error.message
            });
          }
        }
      }

      // Print combined text to console as requested
      console.log('='.repeat(80));
      console.log('COMBINED TEXT FROM REQUIREMENTS PROCESSING:');
      console.log('='.repeat(80));
      console.log(combinedText);
      console.log('='.repeat(80));

      console.log("Returning sample questions...");

      // Get sample questions
      const questions = getSampleQuestions();
      const questionsOutput = JSON.stringify(questions, null, 2);

      // Save to database if user is authenticated
      let projectRecord = null;
      let requirementRecord = null;

      if (userId) {
        try {
          // Create or find project
          if (projectName && teamId) {
            projectRecord = await db.project.create({
              data: {
                name: projectName,
                description: description || '',
                userId: userId,
                teamId: parseInt(teamId),
                status: 'ACTIVE'
              }
            });
          }

          // Create requirement record
          const requirementData = {
            inputText: description || '',
            combinedText: combinedText,
            outputText: questionsOutput,
            filesProcessed: processedFiles.length,
            filesData: JSON.stringify(processedFiles),
            status: 'PROCESSING',
            requestTime: new Date(),
            responseTime: new Date()
          };

          if (projectRecord) {
            requirementData.projectId = projectRecord.id;
          } else {
            // If no project, create a default one
            const defaultProject = await db.project.create({
              data: {
                name: `Project ${new Date().toISOString().split('T')[0]}`,
                description: 'Auto-generated project',
                userId: userId,
                teamId: teamId ? parseInt(teamId) : 1, // Default to first team
                status: 'ACTIVE'
              }
            });
            requirementData.projectId = defaultProject.id;
          }

          requirementRecord = await db.requirement.create({
            data: requirementData
          });

          console.log(`Requirement record saved to database with ID: ${requirementRecord.id}`);
          console.log(`Project record: ${projectRecord ? projectRecord.id : 'default created'}`);
        } catch (dbError) {
          console.error('Database save error:', dbError);
          // Continue without failing the request
        }
      }

      res.status(200).json({
        success: true,
        message: "Requirements processed successfully",
        questions,
        data: {
          projectId: projectRecord?.id,
          requirementId: requirementRecord?.id,
          filesProcessed: processedFiles.length,
          filesFailed: failedFiles.length,
          processedFiles,
          failedFiles: failedFiles.length > 0 ? failedFiles : undefined,
          textLength: combinedText.length,
          status: 'running'
        }
      });

    } catch (error) {
      console.error("Error processing requirements:", error);
      res.status(500).json({
        error: "Internal server error while processing requirements",
        success: false,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

export const enhanceRequirements = async (req, res) => {
  try {
    const { description, answers } = req.body;
    const userId = req.user?.id;

    if (!description && (!answers || answers.length === 0)) {
      return res.status(400).json({
        error: "Description or answers are required",
        success: false
      });
    }

    // TODO: Construct the prompt for Ollama (commented out for now)
    // const prompt = `
    // You are a helpful assistant for a design generator app.
    // Given the following user description and their answers to clarifying questions, construct a more complete and well-structured design description.
    //
    // User description: "${description || 'No description provided'}"
    //
    // Answers to clarifying questions:
    // ${answers ? answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join('\n') : 'No answers provided'}
    //
    // Return only the improved description as a string.
    // `;

    console.log('='.repeat(80));
    console.log('ENHANCING REQUIREMENTS (MOCK MODE):');
    console.log('='.repeat(80));
    console.log('Original description:', description);
    console.log('Answers:', answers);
    console.log('='.repeat(80));

    try {
      // TODO: Enable Ollama integration by uncommenting the code below
      // const improvedDescription = (await generateResponse(prompt)).trim();

      // Mock enhanced description for now
      const improvedDescription = `Enhanced Requirements Analysis

Based on your project description and answers to the clarifying questions, here's a comprehensive and well-structured design description:

Project Overview:
${description || 'No initial description provided'}

Key Requirements:
- User authentication and authorization system
- Responsive web application design
- Database integration for data persistence
- Real-time features and notifications
- Modern UI/UX with clean, intuitive interface

Technical Specifications:
- Frontend: React.js with modern hooks and state management
- Backend: Node.js/Express.js REST API
- Database: PostgreSQL/MongoDB for scalable data storage
- Authentication: JWT-based secure authentication
- Deployment: Cloud-ready containerized architecture

User Experience Features:
- Mobile-responsive design for all devices
- Fast loading times and optimized performance
- Accessibility compliance (WCAG guidelines)
- Progressive Web App capabilities

This enhanced description provides a solid foundation for the development team to begin architectural planning and implementation.`;

      console.log('Enhanced description:', improvedDescription);
      console.log('='.repeat(80));

      // Update database if user is authenticated
      if (userId && req.body.requirementId) {
        try {
          await db.requirement.update({
            where: { id: parseInt(req.body.requirementId) },
            data: {
              outputText: improvedDescription,
              status: 'COMPLETED',
              responseTime: new Date()
            }
          });
          console.log(`Updated requirement record ${req.body.requirementId} with enhanced description`);
        } catch (dbError) {
          console.error('Database update error:', dbError);
          // Continue without failing the request
        }
      }

      res.status(200).json({
        success: true,
        message: "Requirements enhanced successfully",
        improvedDescription,
        originalDescription: description,
        processedAnswers: answers ? answers.length : 0
      });

    } catch (ollamaError) {
      console.error('Ollama API error:', ollamaError);
      res.status(500).json({
        error: "Failed to enhance requirements with AI",
        success: false,
        details: process.env.NODE_ENV === 'development' ? ollamaError.message : undefined
      });
    }

  } catch (error) {
    console.error("Error enhancing requirements:", error);
    res.status(500).json({
      error: "Internal server error while enhancing requirements",
      success: false,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};