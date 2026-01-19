import { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { message } from 'antd';
import { workflowServices, sdGenServices } from '../../../api/apiEndpoints';

export const useAgentCanvas = ({ selectedTeam, onAgentsUpdated, initialAgentData, onComplete, form, onOpenEditModal }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [agentTemplates, setAgentTemplates] = useState([]);
    const [commonAgents, setCommonAgents] = useState([]);
    const [editingNode, setEditingNode] = useState(null);

    // Refs to store handler functions to avoid stale closures
    const handleEditAgentRef = useRef(null);
    const handleDeleteAgentRef = useRef(null);

    // Function to refresh agents list and notify parent
    const refreshAgentsList = useCallback(async () => {
        if (onAgentsUpdated && selectedTeam) {
            try {
                const result = await sdGenServices.getAgentsByTeam(selectedTeam.id);
                if (result.success && result.agents) {
                    onAgentsUpdated(result.agents);
                }
            } catch (error) {
                console.error('Error refreshing agents:', error);
            }
        }
    }, [onAgentsUpdated, selectedTeam]);

    // Load agent templates - This loads team agents for the Templates drawer
    useEffect(() => {
        const fetchTeamAgents = async () => {
            if (selectedTeam && selectedTeam.id) {
                try {
                    const result = await sdGenServices.getAgentsByTeam(selectedTeam.id);
                    if (result.success && result.agents) {
                        const templates = result.agents.map(agent => ({
                            id: agent.id,
                            name: agent.name,
                            description: agent.description || '',
                            prompt: agent.prompt || '',
                            settings: agent.settings || null,
                            icon: agent.icon || 'RobotOutlined'
                        }));
                        setAgentTemplates(templates);
                    }
                } catch (error) {
                    console.error('Error fetching team agents:', error);
                    message.error('Failed to load team agents');
                }
            }
        };

        fetchTeamAgents();
    }, [selectedTeam]);

    // Load common agents from database
    useEffect(() => {
        const fetchCommonAgents = async () => {
            try {
                const result = await sdGenServices.getCommonAgents();
                if (result.success && result.commonAgents) {
                    setCommonAgents(result.commonAgents);
                }
            } catch (error) {
                console.error('Error fetching common agents:', error);
            }
        };

        fetchCommonAgents();
    }, []);

    // Helper to parse settings from string or array
    const parseSettings = (settings) => {
        if (!settings) return [];
        try {
            if (typeof settings === 'string') {
                return JSON.parse(settings);
            }
            return Array.isArray(settings) ? settings : [];
        } catch {
            return [];
        }
    };

    // Declare handlers - these update with dependencies
    const handleEditAgent = useCallback((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            setEditingNode(node);
            if (form) {
                const settings = parseSettings(node.data.settings);
                form.setFieldsValue({
                    name: node.data.name,
                    description: node.data.description,
                    prompt: node.data.prompt,
                    settings: settings
                });
            }
            if (onOpenEditModal) {
                onOpenEditModal();
            }
            return true;
        }
        return false;
    }, [nodes, form, onOpenEditModal]);

    const handleDeleteAgent = useCallback(async (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        if (node.data.dbId) {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const result = await sdGenServices.deleteAgent(node.data.dbId, token);

                if (result.success) {
                    setNodes((nds) => nds.filter(n => n.id !== nodeId));
                    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
                    message.success('Agent deleted successfully');
                    await refreshAgentsList();
                } else {
                    message.error(result.error || 'Failed to delete agent');
                }
            } catch (error) {
                message.error('Failed to delete agent');
            } finally {
                setIsLoading(false);
            }
        } else {
            setNodes((nds) => nds.filter(n => n.id !== nodeId));
            setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
            message.success('Agent removed from canvas');
        }
    }, [nodes, setNodes, setEdges, refreshAgentsList]);

    // Update refs whenever handlers change
    useEffect(() => {
        handleEditAgentRef.current = handleEditAgent;
        handleDeleteAgentRef.current = handleDeleteAgent;
    }, [handleEditAgent, handleDeleteAgent]);

    // Stable wrapper functions that always call the latest handler via ref
    const onEditAgent = useCallback((nodeId) => {
        if (handleEditAgentRef.current) {
            return handleEditAgentRef.current(nodeId);
        }
        return false;
    }, []);

    const onDeleteAgent = useCallback((nodeId) => {
        if (handleDeleteAgentRef.current) {
            handleDeleteAgentRef.current(nodeId);
        }
    }, []);

    // Load initial agent data when provided
    useEffect(() => {
        if (initialAgentData && initialAgentData.agents && initialAgentData.agents.length > 0) {
            const initialNodes = initialAgentData.agents.map(agent => ({
                id: agent.id,
                type: 'agentNode',
                position: agent.position,
                data: {
                    name: agent.name,
                    description: agent.description,
                    prompt: agent.prompt,
                    settings: parseSettings(agent.settings),
                    dbId: agent.dbId,
                    nodeId: agent.id,
                    onEdit: () => onEditAgent(agent.id),
                    onDelete: () => onDeleteAgent(agent.id)
                }
            }));

            const initialEdges = initialAgentData.connections.map(conn => ({
                id: `edge-${conn.from}-${conn.to}`,
                source: conn.from,
                target: conn.to,
                type: 'smoothstep',
                style: { stroke: '#3b82f6', strokeWidth: 2 }
            }));

            setNodes(initialNodes);
            setEdges(initialEdges);

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }, [initialAgentData, setNodes, setEdges, onEditAgent, onDeleteAgent]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            style: { stroke: '#3b82f6', strokeWidth: 2 }
        }, eds)),
        [setEdges]
    );

    const handleAddAgent = useCallback(async (template = null, closeDrawer = () => {}) => {
        if (template) {
            if (!selectedTeam) {
                message.error('Please select a team first');
                return;
            }

            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');

                // Parse template settings
                const templateSettings = parseSettings(template.settings);

                if (template.id) {
                    const nodeId = `agent-${template.id}`;
                    const position = {
                        x: Math.random() * 400 + 100,
                        y: Math.random() * 300 + 100,
                    };

                    const newNode = {
                        id: nodeId,
                        type: 'agentNode',
                        position,
                        data: {
                            name: template.name,
                            description: template.description,
                            prompt: template.prompt,
                            settings: templateSettings,
                            dbId: template.id,
                            onEdit: () => onEditAgent(nodeId),
                            onDelete: () => onDeleteAgent(nodeId)
                        }
                    };
                    setNodes((nds) => [...nds, newNode]);
                    closeDrawer();
                    message.success(`${template.name} added to canvas`);
                } else {
                    const result = await sdGenServices.createAgent({
                        name: template.name,
                        description: template.description,
                        prompt: template.prompt,
                        settings: JSON.stringify(templateSettings),
                        teamId: selectedTeam.id,
                    }, token);

                    if (result.success && result.data.agent) {
                        const nodeId = `agent-${result.data.agent.id}`;
                        const position = {
                            x: Math.random() * 400 + 100,
                            y: Math.random() * 300 + 100,
                        };

                        const newNode = {
                            id: nodeId,
                            type: 'agentNode',
                            position,
                            data: {
                                name: template.name,
                                description: template.description,
                                prompt: template.prompt,
                                settings: templateSettings,
                                dbId: result.data.agent.id,
                                onEdit: () => onEditAgent(nodeId),
                                onDelete: () => onDeleteAgent(nodeId)
                            }
                        };
                        setNodes((nds) => [...nds, newNode]);
                        closeDrawer();
                        message.success(`${template.name} created and added to canvas`);
                        await refreshAgentsList();
                    } else {
                        message.error(result.error || 'Failed to create agent from template');
                    }
                }
            } catch (error) {
                message.error('Failed to add agent');
            } finally {
                setIsLoading(false);
            }
        }
    }, [setNodes, onEditAgent, onDeleteAgent, selectedTeam, refreshAgentsList]);

    const handleAddCommonAgent = useCallback((commonAgent, closeDrawer = () => {}) => {
        const nodeId = `common-agent-${commonAgent.id}-${Date.now()}`;
        const position = {
            x: Math.random() * 400 + 100,
            y: Math.random() * 300 + 100,
        };

        // Parse common agent settings
        const commonAgentSettings = parseSettings(commonAgent.settings);

        const newNode = {
            id: nodeId,
            type: 'agentNode',
            position,
            data: {
                name: commonAgent.name,
                description: commonAgent.description,
                prompt: commonAgent.prompt,
                settings: commonAgentSettings,
                isCommonAgent: true,
                commonAgentId: commonAgent.id,
                category: commonAgent.category,
                onEdit: () => onEditAgent(nodeId),
                onDelete: () => onDeleteAgent(nodeId)
            }
        };
        setNodes((nds) => [...nds, newNode]);
        closeDrawer();
        message.success(`${commonAgent.name} added to canvas`);
    }, [setNodes, onEditAgent, onDeleteAgent]);

    const handleSaveAgent = useCallback(async (values, form) => {
        if (!selectedTeam) {
            message.error('Please select a team first');
            return false;
        }

        // Validate required settings
        const allSettings = values.settings || [];
        const missingRequired = allSettings.filter(s => s && s.required && !s.value);
        if (missingRequired.length > 0) {
            const missingKeys = missingRequired.map(s => s.key).join(', ');
            message.error(`Required settings missing: ${missingKeys}`);
            return false;
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');

        // Process settings - keep all settings including required ones, filter only completely empty
        const settings = allSettings.filter(s => s && s.key) || [];

        try {
            if (editingNode) {
                let dbId = editingNode.data.dbId;
                if (!dbId && editingNode.id.startsWith('agent-')) {
                    dbId = parseInt(editingNode.id.replace('agent-', ''));
                }

                const nodeData = {
                    name: values.name,
                    description: values.description,
                    prompt: values.prompt,
                    settings: settings,
                    dbId: dbId,
                    onEdit: () => onEditAgent(editingNode.id),
                    onDelete: () => onDeleteAgent(editingNode.id)
                };

                setNodes((nds) => nds.map(node =>
                    node.id === editingNode.id ? { ...node, data: nodeData } : node
                ));

                form.resetFields();
                setEditingNode(null);
                message.success('Agent updated in workflow');
                return true;
            } else {
                const result = await sdGenServices.createAgent({
                    name: values.name,
                    description: values.description,
                    prompt: values.prompt,
                    settings: JSON.stringify(settings),
                    teamId: selectedTeam.id,
                }, token);

                if (result.success && result.data.agent) {
                    const nodeId = `agent-${result.data.agent.id}`;
                    const position = {
                        x: Math.random() * 400 + 100,
                        y: Math.random() * 300 + 100,
                    };

                    const nodeData = {
                        name: values.name,
                        description: values.description,
                        prompt: values.prompt,
                        settings: settings,
                        dbId: result.data.agent.id,
                        onEdit: () => onEditAgent(nodeId),
                        onDelete: () => onDeleteAgent(nodeId)
                    };

                    setNodes((nds) => [...nds, {
                        id: nodeId,
                        type: 'agentNode',
                        position,
                        data: nodeData
                    }]);
                    message.success('Agent created and added to canvas');
                    await refreshAgentsList();
                    form.resetFields();
                    setEditingNode(null);
                    return true;
                } else {
                    message.error(result.error || 'Failed to create agent');
                    return false;
                }
            }
        } catch (error) {
            if (!error.errorFields) {
                message.error('Failed to save agent');
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [editingNode, setNodes, onEditAgent, onDeleteAgent, selectedTeam, refreshAgentsList]);

    const handleLoadSampleWorkflow = useCallback(async () => {
        if (!selectedTeam) {
            message.error('Please select a team first');
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const sampleAgents = [
                {
                    name: 'Requirements Analyst',
                    description: 'Analyzes and documents project requirements',
                    prompt: 'You are a Requirements Analyst. Your role is to analyze and document project requirements clearly and comprehensively.',
                    position: { x: 100, y: 100 }
                },
                {
                    name: 'System Architect',
                    description: 'Designs system architecture and technical specifications',
                    prompt: 'You are a System Architect. Your role is to design system architecture and create technical specifications based on the requirements.',
                    position: { x: 400, y: 100 }
                },
                {
                    name: 'Developer',
                    description: 'Implements the code based on architecture',
                    prompt: 'You are a Developer. Your role is to implement code based on the system architecture and technical specifications.',
                    position: { x: 250, y: 300 }
                }
            ];

            const existingAgentsResult = await sdGenServices.getAgentsByTeam(selectedTeam.id);
            const existingAgents = existingAgentsResult.success && existingAgentsResult.agents
                ? existingAgentsResult.agents
                : [];

            const createdAgents = [];
            for (let i = 0; i < sampleAgents.length; i++) {
                const agent = sampleAgents[i];
                const existingAgent = existingAgents.find(ea => ea.name === agent.name);

                if (existingAgent) {
                    createdAgents.push({
                        ...agent,
                        dbId: existingAgent.id
                    });
                } else {
                    const result = await sdGenServices.createAgent({
                        name: agent.name,
                        description: agent.description,
                        prompt: agent.prompt,
                        teamId: selectedTeam.id,
                    }, token);

                    if (result.success && result.data && result.data.agent) {
                        createdAgents.push({
                            ...agent,
                            dbId: result.data.agent.id
                        });
                    }
                }
            }

            if (createdAgents.length === 0) {
                message.error('Failed to load sample agents');
                return;
            }

            const newNodes = createdAgents.map((agent) => {
                const nodeId = `agent-${agent.dbId}`;
                return {
                    id: nodeId,
                    type: 'agentNode',
                    position: agent.position,
                    data: {
                        name: agent.name,
                        description: agent.description,
                        prompt: agent.prompt,
                        dbId: agent.dbId,
                        onEdit: () => onEditAgent(nodeId),
                        onDelete: () => onDeleteAgent(nodeId)
                    }
                };
            });

            const newEdges = [];
            if (newNodes.length >= 2) {
                newEdges.push({
                    id: `edge-${newNodes[0].id}-${newNodes[1].id}`,
                    source: newNodes[0].id,
                    target: newNodes[1].id,
                    type: 'smoothstep',
                    style: { stroke: '#3b82f6', strokeWidth: 2 }
                });
            }
            if (newNodes.length >= 3) {
                newEdges.push({
                    id: `edge-${newNodes[1].id}-${newNodes[2].id}`,
                    source: newNodes[1].id,
                    target: newNodes[2].id,
                    type: 'smoothstep',
                    style: { stroke: '#3b82f6', strokeWidth: 2 }
                });
            }

            setNodes(newNodes);
            setEdges(newEdges);
            message.success('Sample workflow loaded successfully!');

            await refreshAgentsList();
        } catch (error) {
            console.error('Error loading sample workflow:', error);
            message.error('Failed to load sample workflow');
        } finally {
            setIsLoading(false);
        }
    }, [selectedTeam, setNodes, setEdges, onEditAgent, onDeleteAgent, refreshAgentsList]);

    const handleProceedToAgents = useCallback(() => {
        if (nodes.length === 0) {
            message.warning('Please add at least one agent to the canvas');
            return;
        }

        const agentData = {
            teamId: selectedTeam?.id || null,
            agents: nodes.map((node) => ({
                id: node.id,
                name: node.data.name,
                description: node.data.description,
                prompt: node.data.prompt,
                settings: node.data.settings || [],
                position: node.position,
                dbId: node.data.dbId
            })),
            connections: edges.map(edge => ({
                from: edge.source,
                to: edge.target
            }))
        };

        onComplete(agentData);
        message.success('Proceeding with agent pipeline');
    }, [nodes, edges, onComplete, selectedTeam]);

    const handleSaveWorkflow = useCallback(async (values, workflowForm) => {
        if (nodes.length === 0) {
            message.warning('Please add at least one agent before saving');
            return false;
        }

        setIsLoading(true);
        try {
            const workflowData = {
                teamId: selectedTeam?.id || null,
                agents: nodes.map((node) => ({
                    id: node.id,
                    name: node.data.name,
                    description: node.data.description,
                    prompt: node.data.prompt,
                    settings: node.data.settings || [],
                    position: node.position,
                    dbId: node.data.dbId
                })),
                connections: edges.map(edge => ({
                    from: edge.source,
                    to: edge.target
                }))
            };

            const token = localStorage.getItem('token');

            const result = await workflowServices.createWorkflow({
                name: values.workflowName,
                description: values.workflowDescription || '',
                teamId: selectedTeam?.id || null,
                workflowData: JSON.stringify(workflowData)
            }, token);

            if (result.success) {
                message.success('Workflow saved successfully!');
                workflowForm.resetFields();
                return true;
            } else {
                message.error(result.error || 'Failed to save workflow');
                return false;
            }
        } catch (error) {
            message.error('Failed to save workflow');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [nodes, edges, selectedTeam]);

    return {
        // State
        nodes,
        edges,
        isLoading,
        agentTemplates,
        commonAgents,
        editingNode,
        setEditingNode,

        // Node/Edge handlers
        onNodesChange,
        onEdgesChange,
        onConnect,

        // Agent handlers
        onEditAgent,
        onDeleteAgent,
        handleAddAgent,
        handleAddCommonAgent,
        handleSaveAgent,
        handleDeleteAgent,
        handleLoadSampleWorkflow,
        handleProceedToAgents,
        handleSaveWorkflow,
    };
};

export default useAgentCanvas;
