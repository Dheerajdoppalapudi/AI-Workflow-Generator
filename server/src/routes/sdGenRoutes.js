import express from 'express';
import {
  getTeams,
  getAllAgents,
  getAgentsByTeam,
  createAgent,
  updateAgent,
  deleteAgent,
  generateWorkflow,
  getCommonAgents
} from '../controllers/sdGenController.js';
import {
  initializeTeamsAndAgents,
  initializeCommonAgents
} from '../controllers/seedingDataController.js';
import { processRequirements, enhanceRequirements } from '../controllers/requirementController.js';
import { generateInitialPlanning } from '../controllers/planningController.js';
import {
  createWorkflow,
  getWorkflowsByUser,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow
} from '../controllers/workflowController.js';
import {
  executeNode,
  executeWorkflow
} from '../controllers/executionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();



// Requirement routes
router.post('/requirements/process', authenticate, processRequirements);
router.post('/requirements/enhance', authenticate, enhanceRequirements);

// Planning routes
router.post('/planning/initialplanning', authenticate, generateInitialPlanning);

// Team and agent routes (temporarily without authentication for testing)
router.get('/teams', getTeams);
router.get('/agents', getAllAgents);
router.get('/teams/:teamId/agents', getAgentsByTeam);
router.post('/agents', createAgent);
router.put('/agents/:agentId', updateAgent);
router.delete('/agents/:agentId', deleteAgent);
router.post('/initialize', initializeTeamsAndAgents);

// Common agents routes
router.get('/common-agents', getCommonAgents);
router.post('/initialize-common-agents', initializeCommonAgents);

// Workflow routes (temporarily without authentication for testing)
router.post('/workflows', createWorkflow);
router.get('/workflows', getWorkflowsByUser);
router.get('/workflows/:id', getWorkflowById);
router.put('/workflows/:id', updateWorkflow);
router.delete('/workflows/:id', deleteWorkflow);

// AI workflow generation route
router.post('/generate-workflow', generateWorkflow);

// Execution routes
router.post('/execute/node', executeNode);
router.post('/execute/workflow', executeWorkflow);

export default router;