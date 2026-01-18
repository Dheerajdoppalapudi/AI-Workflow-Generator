import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    Handle,
    Position
} from 'reactflow';
import {
    Typography,
    Button,
    Card,
    Modal,
    Input,
    Form,
    message,
    Drawer,
    List,
    Space,
    Tooltip,
    Tag,
    Spin
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    PlayCircleOutlined,
    NodeIndexOutlined,
    RobotOutlined,
    SettingOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../context/ThemeContext';
import { workflowServices, sdGenServices } from '../../api/apiEndpoints';

import 'reactflow/dist/style.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Custom Agent Node Component
const AgentNode = ({ data, selected }) => {
    const { theme } = useContext(ThemeContext);
    const isDarkMode = theme === 'dark';

    return (
        <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `2px solid ${selected ? '#3b82f6' : (isDarkMode ? '#374151' : '#e5e7eb')}`,
            boxShadow: selected
                ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            position: 'relative'
        }}>
            {/* Top Handle */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                style={{
                    background: '#3b82f6',
                    width: 8,
                    height: 8,
                    border: '2px solid #ffffff',
                    top: -5
                }}
            />

            {/* Left Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{
                    background: '#3b82f6',
                    width: 8,
                    height: 8,
                    border: '2px solid #ffffff'
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <RobotOutlined style={{
                    color: '#3b82f6',
                    fontSize: 16
                }} />
                <Text strong style={{
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    fontSize: 14
                }}>
                    {data.name}
                </Text>
            </div>

            <Text style={{
                color: isDarkMode ? '#d1d5db' : '#6b7280',
                fontSize: 12,
                display: 'block',
                marginBottom: 8
            }}>
                {data.description.length > 50
                    ? `${data.description.substring(0, 50)}...`
                    : data.description}
            </Text>

            <div style={{ display: 'flex', gap: 4 }}>
                <Button
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onEdit?.();
                    }}
                />
                <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onDelete?.();
                    }}
                />
            </div>

            {/* Right Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{
                    background: '#10b981',
                    width: 8,
                    height: 8,
                    border: '2px solid #ffffff'
                }}
            />

            {/* Bottom Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                style={{
                    background: '#10b981',
                    width: 8,
                    height: 8,
                    border: '2px solid #ffffff',
                    bottom: -5
                }}
            />
        </div>
    );
};

const nodeTypes = {
    agentNode: AgentNode,
};

const AgentCanvasDesigner = ({ onComplete, isDarkMode, initialAgentData = null, selectedTeam = null, onAgentsUpdated = null }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
    const [isSaveWorkflowModalOpen, setIsSaveWorkflowModalOpen] = useState(false);
    const [isTemplateDetailsModalOpen, setIsTemplateDetailsModalOpen] = useState(false);
    const [selectedTemplateForView, setSelectedTemplateForView] = useState(null);
    const [editingNode, setEditingNode] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agentTemplates, setAgentTemplates] = useState([]);
    const [commonAgents, setCommonAgents] = useState([]);
    const [form] = Form.useForm();
    const [workflowForm] = Form.useForm();

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

    // Load common agents
    useEffect(() => {
        const fetchCommonAgents = async () => {
            try {
                // First try to initialize common agents (will skip if already done)
                await sdGenServices.initializeCommonAgents();

                // Then fetch them
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

    // Declare handlers - these update with dependencies
    const handleEditAgent = useCallback((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            setEditingNode(node);
            form.setFieldsValue({
                name: node.data.name,
                description: node.data.description,
                prompt: node.data.prompt
            });
            setIsModalOpen(true);
        }
    }, [nodes, form]);

    const handleDeleteAgent = useCallback(async (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // If the agent has a database ID, delete from database
        if (node.data.dbId) {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const result = await sdGenServices.deleteAgent(node.data.dbId, token);

                if (result.success) {
                    // Remove from canvas after successful database deletion
                    setNodes((nds) => nds.filter(n => n.id !== nodeId));
                    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
                    message.success('Agent deleted successfully');
                    // Refresh agents list
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
            // If no database ID, just remove from canvas
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
            handleEditAgentRef.current(nodeId);
        }
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
                    dbId: agent.dbId, // Keep track of database ID
                    nodeId: agent.id, // Store the node ID
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

            // Fit view after a short delay to ensure nodes are rendered
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

    const handleAddAgent = useCallback(async (template = null) => {
        if (template) {
            // Check if a team is selected
            if (!selectedTeam) {
                message.error('Please select a team first');
                return;
            }

            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');

                // If template has an ID (database agent), just add to canvas
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
                            dbId: template.id,
                            onEdit: () => onEditAgent(nodeId),
                            onDelete: () => onDeleteAgent(nodeId)
                        }
                    };
                    setNodes((nds) => [...nds, newNode]);
                    setIsTemplateDrawerOpen(false);
                    message.success(`${template.name} added to canvas`);
                } else {
                    // Create new agent in database from template
                    const result = await sdGenServices.createAgent({
                        name: template.name,
                        description: template.description,
                        prompt: template.prompt,
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
                                dbId: result.data.agent.id,
                                onEdit: () => onEditAgent(nodeId),
                                onDelete: () => onDeleteAgent(nodeId)
                            }
                        };
                        setNodes((nds) => [...nds, newNode]);
                        setIsTemplateDrawerOpen(false);
                        message.success(`${template.name} created and added to canvas`);
                        // Refresh agents list
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
        } else {
            // Add custom agent - open modal
            setEditingNode(null);
            form.resetFields();
            setIsModalOpen(true);
        }
    }, [setNodes, form, onEditAgent, onDeleteAgent, selectedTeam, nodes.length, refreshAgentsList]);

    // Handle adding a common agent to the canvas (without creating in team database)
    const handleAddCommonAgent = useCallback((commonAgent) => {
        const nodeId = `common-agent-${commonAgent.id}-${Date.now()}`;
        const position = {
            x: Math.random() * 400 + 100,
            y: Math.random() * 300 + 100,
        };

        const newNode = {
            id: nodeId,
            type: 'agentNode',
            position,
            data: {
                name: commonAgent.name,
                description: commonAgent.description,
                prompt: commonAgent.prompt,
                isCommonAgent: true,
                commonAgentId: commonAgent.id,
                category: commonAgent.category,
                onEdit: () => onEditAgent(nodeId),
                onDelete: () => onDeleteAgent(nodeId)
            }
        };
        setNodes((nds) => [...nds, newNode]);
        setIsTemplateDrawerOpen(false);
        message.success(`${commonAgent.name} added to canvas`);
    }, [setNodes, onEditAgent, onDeleteAgent]);

    const handleSaveAgent = useCallback(async () => {
        try {
            const values = await form.validateFields();

            // Check if a team is selected
            if (!selectedTeam) {
                message.error('Please select a team first');
                return;
            }

            setIsLoading(true);
            const token = localStorage.getItem('token');

            if (editingNode) {
                // Update node on canvas only (don't update database)
                // Extract dbId from node data or parse from node ID
                let dbId = editingNode.data.dbId;
                if (!dbId && editingNode.id.startsWith('agent-')) {
                    dbId = parseInt(editingNode.id.replace('agent-', ''));
                }

                // Update node on canvas with edited values
                const nodeData = {
                    name: values.name,
                    description: values.description,
                    prompt: values.prompt,
                    dbId: dbId,
                    onEdit: () => onEditAgent(editingNode.id),
                    onDelete: () => onDeleteAgent(editingNode.id)
                };

                setNodes((nds) => nds.map(node =>
                    node.id === editingNode.id ? { ...node, data: nodeData } : node
                ));

                // Close modal and reset form
                setIsModalOpen(false);
                form.resetFields();
                setEditingNode(null);
                message.success('Agent updated in workflow');
            } else {
                // Create new custom agent in database
                const result = await sdGenServices.createAgent({
                    name: values.name,
                    description: values.description,
                    prompt: values.prompt,
                    teamId: selectedTeam.id,
                }, token);

                if (result.success && result.data.agent) {
                    // Add node to canvas only after successful database creation
                    const nodeId = `agent-${result.data.agent.id}`;
                    const position = {
                        x: Math.random() * 400 + 100,
                        y: Math.random() * 300 + 100,
                    };

                    const nodeData = {
                        name: values.name,
                        description: values.description,
                        prompt: values.prompt,
                        dbId: result.data.agent.id, // Store database ID
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
                    // Refresh agents list
                    await refreshAgentsList();
                } else {
                    message.error(result.error || 'Failed to create agent');
                }
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingNode(null);
        } catch (error) {
            if (!error.errorFields) {
                message.error('Failed to save agent');
            }
        } finally {
            setIsLoading(false);
        }
    }, [editingNode, form, setNodes, onEditAgent, onDeleteAgent, selectedTeam, nodes.length, refreshAgentsList]);

    const handleLoadSampleWorkflow = useCallback(async () => {
        if (!selectedTeam) {
            message.error('Please select a team first');
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Define sample workflow structure
            const sampleAgents = [
                {
                    name: 'Requirements Analyst',
                    description: 'Analyzes and documents project requirements',
                    prompt: '',
                    position: { x: 100, y: 100 }
                },
                {
                    name: 'System Architect',
                    description: 'Designs system architecture and technical specifications',
                    prompt: '',
                    position: { x: 400, y: 100 }
                },
                {
                    name: 'Developer',
                    description: 'Implements the code based on architecture',
                    prompt: '',
                    position: { x: 250, y: 300 }
                }
            ];

            // Create agents in database
            const createdAgents = [];
            for (let i = 0; i < sampleAgents.length; i++) {
                const agent = sampleAgents[i];
                const result = await sdGenServices.createAgent({
                    name: agent.name,
                    description: agent.description,
                    prompt: agent.prompt,
                    teamId: selectedTeam.id,
                }, token);

                if (result.success && result.data.agent) {
                    createdAgents.push({
                        ...agent,
                        dbId: result.data.agent.id
                    });
                }
            }

            // Create nodes on canvas
            const newNodes = createdAgents.map((agent, index) => {
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

            // Create connections
            const newEdges = [
                {
                    id: `edge-${newNodes[0].id}-${newNodes[1].id}`,
                    source: newNodes[0].id,
                    target: newNodes[1].id,
                    type: 'smoothstep',
                    style: { stroke: '#3b82f6', strokeWidth: 2 }
                },
                {
                    id: `edge-${newNodes[1].id}-${newNodes[2].id}`,
                    source: newNodes[1].id,
                    target: newNodes[2].id,
                    type: 'smoothstep',
                    style: { stroke: '#3b82f6', strokeWidth: 2 }
                }
            ];

            setNodes(newNodes);
            setEdges(newEdges);
            message.success('Sample workflow loaded successfully!');

            // Refresh agents list
            await refreshAgentsList();
        } catch (error) {
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
            agents: nodes.map((node, index) => ({
                id: node.id,
                name: node.data.name,
                description: node.data.description,
                prompt: node.data.prompt,
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

    const handleSaveWorkflow = useCallback(async (values) => {
        if (nodes.length === 0) {
            message.warning('Please add at least one agent before saving');
            return;
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
                setIsSaveWorkflowModalOpen(false);
                workflowForm.resetFields();
            } else {
                message.error(result.error || 'Failed to save workflow');
            }
        } catch (error) {
            message.error('Failed to save workflow');
        } finally {
            setIsLoading(false);
        }
    }, [nodes, edges, selectedTeam, workflowForm]);

    const handleViewTemplateDetails = useCallback((template) => {
        setSelectedTemplateForView(template);
        setIsTemplateDetailsModalOpen(true);
    }, []);

    return (
        <div style={{
            height: 'calc(100vh - 180px)',
            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
            borderRadius: 8,
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={4} style={{
                            margin: 0,
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <NodeIndexOutlined style={{ color: '#3b82f6' }} />
                            {selectedTeam ? `${selectedTeam.name} - Agent Pipeline` : 'Agent Canvas Designer'}
                        </Title>
                        <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                            {selectedTeam
                                ? `Review and customize the ${selectedTeam.name} agent workflow`
                                : 'Design your AI agent pipeline by adding and connecting agents'
                            }
                        </Text>
                    </div>
                    <Space>
                        <Button
                            icon={<RobotOutlined />}
                            onClick={() => setIsTemplateDrawerOpen(true)}
                            style={{ height: 32 }}
                        >
                            Templates
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddAgent()}
                            style={{ height: 32 }}
                        >
                            Add Agent
                        </Button>
                        <Button
                            icon={<SaveOutlined />}
                            onClick={() => setIsSaveWorkflowModalOpen(true)}
                            style={{ height: 32 }}
                        >
                            Save Workflow
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={handleProceedToAgents}
                            style={{
                                backgroundColor: '#10b981',
                                borderColor: '#10b981',
                                height: 32
                            }}
                        >
                            Proceed
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Canvas */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{
                        padding: 0.2,
                        includeHiddenNodes: false,
                        minZoom: 0.5,
                        maxZoom: 1.5
                    }}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    style={{
                        backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                        width: '100%',
                        height: '100%'
                    }}
                >
                <Background
                    variant="dots"
                    color={isDarkMode ? '#6b7280' : '#9ca3af'}
                    gap={25}
                    size={2}
                />
                <Controls
                    style={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}
                />
                <MiniMap
                    style={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                    }}
                />

                {/* Instructions Panel */}
                {nodes.length === 0 && (
                    <Panel position="center">
                        <Card style={{
                            textAlign: 'center',
                            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}>
                            <RobotOutlined style={{
                                fontSize: 48,
                                color: isDarkMode ? '#6b7280' : '#9ca3af',
                                marginBottom: 16
                            }} />
                            <Title level={4} style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                marginBottom: 8
                            }}>
                                Start Building Your Agent Pipeline
                            </Title>
                            <Text style={{
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                display: 'block',
                                marginBottom: 16
                            }}>
                                Add agents to the canvas and connect them to create your workflow
                            </Text>
                            {selectedTeam ? (
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <Button
                                        type="primary"
                                        icon={<RobotOutlined />}
                                        onClick={() => setIsTemplateDrawerOpen(true)}
                                        block
                                    >
                                        Choose Template
                                    </Button>
                                    <Button
                                        type="dashed"
                                        icon={<NodeIndexOutlined />}
                                        onClick={handleLoadSampleWorkflow}
                                        block
                                        style={{
                                            borderColor: '#3b82f6',
                                            color: '#3b82f6'
                                        }}
                                    >
                                        Load Sample Workflow
                                    </Button>
                                </Space>
                            ) : (
                                <Text style={{
                                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                                    fontSize: 14
                                }}>
                                    Please select a team to start building your workflow
                                </Text>
                            )}
                        </Card>
                    </Panel>
                )}
            </ReactFlow>
            </div>

            {/* Agent Form Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: '#3b82f6' }} />
                        {editingNode ? 'Edit Agent' : 'Add New Agent'}
                    </div>
                }
                open={isModalOpen}
                onOk={handleSaveAgent}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingNode(null);
                }}
                okText={editingNode ? 'Update' : 'Add'}
                width={600}
                confirmLoading={isLoading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                    onFinish={handleSaveAgent}
                >
                    <Form.Item
                        name="name"
                        label="Agent Name"
                        rules={[{ required: true, message: 'Please enter agent name' }]}
                    >
                        <Input placeholder="e.g., Requirements Analyst" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Describe what this agent does..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="prompt"
                        label="Agent Prompt"
                        rules={[{ required: true, message: 'Please enter agent prompt' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter the prompt that defines this agent's behavior..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Template Drawer */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: '#3b82f6' }} />
                        Agent Templates
                    </div>
                }
                placement="right"
                open={isTemplateDrawerOpen}
                onClose={() => setIsTemplateDrawerOpen(false)}
                width={400}
            >
                {/* Team Agents Section */}
                {selectedTeam && agentTemplates.length > 0 && (
                    <>
                        <div style={{
                            marginBottom: 12,
                            paddingBottom: 8,
                            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: 14
                            }}>
                                Team Agents
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 12,
                                marginLeft: 8
                            }}>
                                ({selectedTeam.name})
                            </Text>
                        </div>
                        <List
                            dataSource={agentTemplates}
                            renderItem={(template) => (
                                <List.Item
                                    style={{
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: 8,
                                        padding: 16,
                                        marginBottom: 12,
                                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
                                    }}
                                >
                                    <div style={{ width: '100%' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: 8
                                        }}>
                                            <Text strong style={{
                                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                                fontSize: 14,
                                                flex: 1
                                            }}>
                                                {template.name}
                                            </Text>
                                            <Space size="small">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<SettingOutlined />}
                                                    onClick={() => handleViewTemplateDetails(template)}
                                                    style={{
                                                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                                                    }}
                                                />
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => handleAddAgent(template)}
                                                >
                                                    Add
                                                </Button>
                                            </Space>
                                        </div>
                                        <Text style={{
                                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                                            fontSize: 12,
                                            display: 'block'
                                        }}>
                                            {template.description}
                                        </Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </>
                )}

                {/* Common Agents Section */}
                {commonAgents.length > 0 && (
                    <>
                        <div style={{
                            marginTop: selectedTeam && agentTemplates.length > 0 ? 24 : 0,
                            marginBottom: 12,
                            paddingBottom: 8,
                            borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                        }}>
                            <Text strong style={{
                                color: '#10b981',
                                fontSize: 14
                            }}>
                                Common Agents
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 12,
                                marginLeft: 8
                            }}>
                                (Reusable utilities)
                            </Text>
                        </div>

                        {/* Group common agents by category */}
                        {Object.entries(
                            commonAgents.reduce((acc, agent) => {
                                const category = agent.category || 'Other';
                                if (!acc[category]) acc[category] = [];
                                acc[category].push(agent);
                                return acc;
                            }, {})
                        ).map(([category, agents]) => (
                            <div key={category} style={{ marginBottom: 16 }}>
                                <Tag
                                    color={isDarkMode ? 'default' : 'processing'}
                                    style={{
                                        marginBottom: 8,
                                        fontSize: 11,
                                        backgroundColor: isDarkMode ? '#374151' : undefined
                                    }}
                                >
                                    {category}
                                </Tag>
                                <List
                                    dataSource={agents}
                                    renderItem={(commonAgent) => (
                                        <List.Item
                                            style={{
                                                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                                borderRadius: 8,
                                                padding: 12,
                                                marginBottom: 8,
                                                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                                                borderLeft: `3px solid #10b981`
                                            }}
                                        >
                                            <div style={{ width: '100%' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: 4
                                                }}>
                                                    <Text strong style={{
                                                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                                        fontSize: 13,
                                                        flex: 1
                                                    }}>
                                                        {commonAgent.name}
                                                    </Text>
                                                    <Space size="small">
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<SettingOutlined />}
                                                            onClick={() => handleViewTemplateDetails(commonAgent)}
                                                            style={{
                                                                color: isDarkMode ? '#9ca3af' : '#6b7280'
                                                            }}
                                                        />
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => handleAddCommonAgent(commonAgent)}
                                                            style={{
                                                                backgroundColor: '#10b981',
                                                                borderColor: '#10b981'
                                                            }}
                                                        >
                                                            Add
                                                        </Button>
                                                    </Space>
                                                </div>
                                                <Text style={{
                                                    color: isDarkMode ? '#d1d5db' : '#6b7280',
                                                    fontSize: 11,
                                                    display: 'block'
                                                }}>
                                                    {commonAgent.description}
                                                </Text>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        ))}
                    </>
                )}

                {/* Empty state */}
                {agentTemplates.length === 0 && commonAgents.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 40,
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                    }}>
                        <RobotOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
                        <div>No agent templates available</div>
                        <div style={{ fontSize: 12, marginTop: 8 }}>
                            Select a team to see its agents
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Save Workflow Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SaveOutlined style={{ color: '#3b82f6' }} />
                        Save Workflow
                    </div>
                }
                open={isSaveWorkflowModalOpen}
                onOk={() => workflowForm.submit()}
                onCancel={() => {
                    setIsSaveWorkflowModalOpen(false);
                    workflowForm.resetFields();
                }}
                okText="Save"
                width={500}
                confirmLoading={isLoading}
            >
                <Form
                    form={workflowForm}
                    layout="vertical"
                    onFinish={handleSaveWorkflow}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="workflowName"
                        label="Workflow Name"
                        rules={[{ required: true, message: 'Please enter workflow name' }]}
                    >
                        <Input placeholder="e.g., My Custom Agent Pipeline" />
                    </Form.Item>

                    <Form.Item
                        name="workflowDescription"
                        label="Description (Optional)"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Describe your workflow..."
                        />
                    </Form.Item>

                    {selectedTeam && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                This workflow will be saved under team: <Text strong>{selectedTeam.name}</Text>
                            </Text>
                        </div>
                    )}
                </Form>
            </Modal>

            {/* Template Details Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: '#3b82f6' }} />
                        Agent Details
                    </div>
                }
                open={isTemplateDetailsModalOpen}
                onCancel={() => {
                    setIsTemplateDetailsModalOpen(false);
                    setSelectedTemplateForView(null);
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setIsTemplateDetailsModalOpen(false);
                            setSelectedTemplateForView(null);
                        }}
                    >
                        Close
                    </Button>,
                    <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            if (selectedTemplateForView) {
                                handleAddAgent(selectedTemplateForView);
                                setIsTemplateDetailsModalOpen(false);
                                setSelectedTemplateForView(null);
                            }
                        }}
                    >
                        Add to Canvas
                    </Button>
                ]}
                width={600}
            >
                {selectedTemplateForView && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 20 }}>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: 14,
                                display: 'block',
                                marginBottom: 4
                            }}>
                                Name
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#d1d5db' : '#6b7280',
                                fontSize: 14
                            }}>
                                {selectedTemplateForView.name}
                            </Text>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: 14,
                                display: 'block',
                                marginBottom: 4
                            }}>
                                Description
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#d1d5db' : '#6b7280',
                                fontSize: 14
                            }}>
                                {selectedTemplateForView.description || 'No description provided'}
                            </Text>
                        </div>

                        <div>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: 14,
                                display: 'block',
                                marginBottom: 4
                            }}>
                                Prompt
                            </Text>
                            <div style={{
                                padding: '12px',
                                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                                borderRadius: '6px',
                                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                <Text style={{
                                    color: isDarkMode ? '#d1d5db' : '#6b7280',
                                    fontSize: 13,
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace'
                                }}>
                                    {selectedTemplateForView.prompt || 'No prompt provided'}
                                </Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Loading Overlay */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    borderRadius: 8
                }}>
                    <Spin size="large" style={{ marginBottom: 16 }} />
                    <div style={{
                        color: '#ffffff',
                        fontSize: 18,
                        fontWeight: 500,
                        textAlign: 'center'
                    }}>
                        Agents are loading up...
                    </div>
                    <div style={{
                        color: '#d1d5db',
                        fontSize: 14,
                        marginTop: 8,
                        textAlign: 'center'
                    }}>
                        Setting up your agent pipeline
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentCanvasDesigner;