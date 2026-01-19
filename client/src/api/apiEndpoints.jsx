const BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/users/register`,
    LOGIN: `${BASE_URL}/users/login`,
  },
  
  USER: {
    PROFILE: `${BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
  },
  
  ADMIN: {
    GET_ALL_USERS: `${BASE_URL}/users/admin/users`,
  },
  
  DESIGN: {
    PROCESS_DESCRIPTION: `${BASE_URL}/process`,
    SAVE_ANSWERS: `${BASE_URL}/answers`,
  },

  SDGEN: {
    GET_TEAMS: `${BASE_URL}/sdgen/teams`,
    GET_ALL_AGENTS: `${BASE_URL}/sdgen/agents`,
    GET_AGENTS_BY_TEAM: `${BASE_URL}/sdgen/teams`,
    CREATE_AGENT: `${BASE_URL}/sdgen/agents`,
    UPDATE_AGENT: `${BASE_URL}/sdgen/agents`,
    DELETE_AGENT: `${BASE_URL}/sdgen/agents`,
    PROCESS_REQUIREMENTS: `${BASE_URL}/sdgen/requirements/process`,
    ENHANCE_REQUIREMENTS: `${BASE_URL}/sdgen/requirements/enhance`,
    INITIAL_PLANNING: `${BASE_URL}/sdgen/planning/initialplanning`,
    INITIALIZE: `${BASE_URL}/sdgen/initialize`,
    CREATE_WORKFLOW: `${BASE_URL}/sdgen/workflows`,
    GET_WORKFLOWS: `${BASE_URL}/sdgen/workflows`,
    GET_WORKFLOW_BY_ID: `${BASE_URL}/sdgen/workflows`,
    UPDATE_WORKFLOW: `${BASE_URL}/sdgen/workflows`,
    DELETE_WORKFLOW: `${BASE_URL}/sdgen/workflows`,
    GENERATE_WORKFLOW: `${BASE_URL}/sdgen/generate-workflow`,
    GET_COMMON_AGENTS: `${BASE_URL}/sdgen/common-agents`,
  }
};

export const apiRequest = async (url, method = 'GET', data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      credentials: 'include',
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || responseData.message || 'Something went wrong!');
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error('API Error:', error.message);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};

export const authServices = {
  register: async (userData) => {
    return await apiRequest(API_ENDPOINTS.AUTH.REGISTER, 'POST', userData);
  },
  
  login: async (credentials) => {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGIN, 'POST', credentials);
  }
};

export const userServices = {
  getProfile: async (token) => {
    return await apiRequest(API_ENDPOINTS.USER.PROFILE, 'GET', null, token);
  },
  
  updateProfile: async (userData, token) => {
    return await apiRequest(API_ENDPOINTS.USER.UPDATE_PROFILE, 'PUT', userData, token);
  }
};

export const adminServices = {
  getAllUsers: async (token) => {
    return await apiRequest(API_ENDPOINTS.ADMIN.GET_ALL_USERS, 'GET', null, token);
  }
};

// Design services
export const designServices = {
  processDescription: async (description, token) => {
    return await apiRequest(API_ENDPOINTS.DESIGN.PROCESS_DESCRIPTION, 'POST', { description }, token);
  },

  saveAnswers: async (data, token) => {
    return await apiRequest(API_ENDPOINTS.DESIGN.SAVE_ANSWERS, 'POST', data, token);
  }
};

// SD Gen services
export const sdGenServices = {
  getTeams: async () => {
    const response = await fetch(API_ENDPOINTS.SDGEN.GET_TEAMS);
    return await response.json();
  },

  getAllAgents: async () => {
    const response = await fetch(API_ENDPOINTS.SDGEN.GET_ALL_AGENTS);
    return await response.json();
  },

  getAgentsByTeam: async (teamId) => {
    const response = await fetch(`${API_ENDPOINTS.SDGEN.GET_AGENTS_BY_TEAM}/${teamId}/agents`);
    return await response.json();
  },

  createAgent: async (agentData, token) => {
    return await apiRequest(API_ENDPOINTS.SDGEN.CREATE_AGENT, 'POST', agentData, token);
  },

  updateAgent: async (agentId, agentData, token) => {
    return await apiRequest(`${API_ENDPOINTS.SDGEN.UPDATE_AGENT}/${agentId}`, 'PUT', agentData, token);
  },

  deleteAgent: async (agentId, token) => {
    return await apiRequest(`${API_ENDPOINTS.SDGEN.DELETE_AGENT}/${agentId}`, 'DELETE', null, token);
  },

  processRequirements: async (formData, token) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.SDGEN.PROCESS_REQUIREMENTS, {
      method: 'POST',
      headers,
      body: formData
    });
    return await response.json();
  },

  initialize: async () => {
    const response = await fetch(API_ENDPOINTS.SDGEN.INITIALIZE, {
      method: 'POST'
    });
    return await response.json();
  },

  getCommonAgents: async () => {
    const response = await fetch(API_ENDPOINTS.SDGEN.GET_COMMON_AGENTS);
    return await response.json();
  }
};

// Requirements services
export const requirementServices = {
  processRequirements: async (formData, token) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.SDGEN.PROCESS_REQUIREMENTS, {
      method: 'POST',
      headers,
      body: formData
    });
    return await response.json();
  },

  enhanceRequirements: async (data, token) => {
    return await apiRequest(API_ENDPOINTS.SDGEN.ENHANCE_REQUIREMENTS, 'POST', data, token);
  }
};

// Planning services
export const planningServices = {
  generateInitialPlanning: async (data, token) => {
    return await apiRequest(API_ENDPOINTS.SDGEN.INITIAL_PLANNING, 'POST', data, token);
  }
};

// Workflow services
export const workflowServices = {
  createWorkflow: async (workflowData, token) => {
    return await apiRequest(API_ENDPOINTS.SDGEN.CREATE_WORKFLOW, 'POST', workflowData, token);
  },

  getWorkflows: async (token) => {
    return await apiRequest(API_ENDPOINTS.SDGEN.GET_WORKFLOWS, 'GET', null, token);
  },

  getWorkflowById: async (workflowId, token) => {
    return await apiRequest(`${API_ENDPOINTS.SDGEN.GET_WORKFLOW_BY_ID}/${workflowId}`, 'GET', null, token);
  },

  updateWorkflow: async (workflowId, workflowData, token) => {
    return await apiRequest(`${API_ENDPOINTS.SDGEN.UPDATE_WORKFLOW}/${workflowId}`, 'PUT', workflowData, token);
  },

  deleteWorkflow: async (workflowId, token) => {
    return await apiRequest(`${API_ENDPOINTS.SDGEN.DELETE_WORKFLOW}/${workflowId}`, 'DELETE', null, token);
  },

  generateWorkflow: async (userPrompt, teamId = null) => {
    return await apiRequest(API_ENDPOINTS.SDGEN.GENERATE_WORKFLOW, 'POST', { userPrompt, teamId });
  }
};