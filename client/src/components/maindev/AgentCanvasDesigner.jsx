import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    Panel,
    MarkerType,
    ConnectionLineType
} from 'reactflow';
import {
    Typography,
    Button,
    Card,
    Space,
    Form,
    Spin,
    Switch,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    PlayCircleOutlined,
    NodeIndexOutlined,
    RobotOutlined,
    ExpandOutlined,
    CompressOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

import 'reactflow/dist/style.css';

// Import subcomponents
import { nodeTypes } from './canvas/AgentNode';
import { AgentFormModal, SaveWorkflowModal, TemplateDetailsModal } from './canvas/AgentModals';
import TemplateDrawer from './canvas/TemplateDrawer';
import useAgentCanvas from './canvas/useAgentCanvas';

const { Title, Text } = Typography;

// n8n-style edge options - smooth bezier curves with modern look
const defaultEdgeOptions = {
    type: 'default',
    style: {
        stroke: '#94a3b8',
        strokeWidth: 2,
        strokeLinecap: 'round'
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
        width: 20,
        height: 20
    }
};

const AgentCanvasDesigner = ({ onComplete, isDarkMode, initialAgentData = null, selectedTeam = null, onAgentsUpdated = null }) => {
    // Modal/Drawer states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
    const [isSaveWorkflowModalOpen, setIsSaveWorkflowModalOpen] = useState(false);
    const [isTemplateDetailsModalOpen, setIsTemplateDetailsModalOpen] = useState(false);
    const [selectedTemplateForView, setSelectedTemplateForView] = useState(null);

    // Maximized view state
    const [isMaximized, setIsMaximized] = useState(false);

    // Forms
    const [form] = Form.useForm();
    const [workflowForm] = Form.useForm();

    // Use the custom hook for all business logic
    const {
        nodes,
        edges,
        isLoading,
        agentTemplates,
        commonAgents,
        editingNode,
        setEditingNode,
        onNodesChange,
        onEdgesChange,
        onConnect,
        handleAddAgent,
        handleAddCommonAgent,
        handleSaveAgent,
        handleLoadSampleWorkflow,
        handleProceedToAgents,
        handleSaveWorkflow,
        executionMode,
        setExecutionMode,
        startCanvasExecution
    } = useAgentCanvas({
        selectedTeam,
        onAgentsUpdated,
        initialAgentData,
        onComplete,
        form,
        onOpenEditModal: () => setIsModalOpen(true)
    });

    // Open modal for adding new agent
    const openAddAgentModal = useCallback(() => {
        setEditingNode(null);
        form.resetFields();
        setIsModalOpen(true);
    }, [form, setEditingNode]);

    // Handle save agent from modal
    const onSaveAgent = useCallback(async () => {
        try {
            const values = await form.validateFields();
            const success = await handleSaveAgent(values, form);
            if (success) {
                setIsModalOpen(false);
            }
        } catch (error) {
            // Form validation error - do nothing
        }
    }, [form, handleSaveAgent]);

    // Handle adding agent from template
    const onAddAgentFromTemplate = useCallback((template) => {
        handleAddAgent(template, () => setIsTemplateDrawerOpen(false));
    }, [handleAddAgent]);

    // Handle adding common agent
    const onAddCommonAgentFromDrawer = useCallback((commonAgent) => {
        handleAddCommonAgent(commonAgent, () => setIsTemplateDrawerOpen(false));
    }, [handleAddCommonAgent]);

    // Handle save workflow from modal
    const onSaveWorkflow = useCallback(async (values) => {
        const success = await handleSaveWorkflow(values, workflowForm);
        if (success) {
            setIsSaveWorkflowModalOpen(false);
        }
    }, [handleSaveWorkflow, workflowForm]);

    // View template details
    const handleViewTemplateDetails = useCallback((template) => {
        setSelectedTemplateForView(template);
        setIsTemplateDetailsModalOpen(true);
    }, []);

    // Close template details modal
    const closeTemplateDetails = useCallback(() => {
        setIsTemplateDetailsModalOpen(false);
        setSelectedTemplateForView(null);
    }, []);

    // Add template from details modal
    const addTemplateFromDetails = useCallback((template) => {
        handleAddAgent(template, () => setIsTemplateDrawerOpen(false));
    }, [handleAddAgent]);

    // Toggle maximized view
    const toggleMaximized = useCallback(() => {
        setIsMaximized(prev => !prev);
    }, []);

    // Handle execution mode toggle
    const handleExecutionModeToggle = useCallback((checked) => {
        setExecutionMode(checked ? 'canvas' : 'page');
    }, [setExecutionMode]);

    // Handle execute button click
    const handleExecuteClick = useCallback(() => {
        if (executionMode === 'canvas') {
            startCanvasExecution();
        } else {
            handleProceedToAgents();
        }
    }, [executionMode, startCanvasExecution, handleProceedToAgents]);

    // Container style for maximized/normal view
    const containerStyle = isMaximized ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: isDarkMode ? '#171717' : '#fafafa',
        borderRadius: 0,
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh'
    } : {
        height: '75vh',
        backgroundColor: isDarkMode ? '#171717' : '#fafafa',
        borderRadius: 6,
        border: `1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{
                padding: '12px 20px',
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
                            gap: 8,
                            fontSize: 16
                        }}>
                            <NodeIndexOutlined style={{ color: '#3b82f6' }} />
                            {selectedTeam ? `${selectedTeam.name} - Agent Pipeline` : 'Agent Canvas Designer'}
                        </Title>
                        <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                            {selectedTeam
                                ? `Design and execute the ${selectedTeam.name} agent workflow`
                                : 'Design your AI agent pipeline by adding and connecting agents'
                            }
                        </Text>
                    </div>
                    <Space>
                        {/* Nodes Button */}
                        <Button
                            icon={<RobotOutlined />}
                            onClick={() => setIsTemplateDrawerOpen(true)}
                        >
                            Nodes
                        </Button>

                        {/* Add Agent Button */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openAddAgentModal}
                        >
                            Add Agent
                        </Button>

                        {/* Save Workflow Button */}
                        <Button
                            icon={<SaveOutlined />}
                            onClick={() => setIsSaveWorkflowModalOpen(true)}
                        >
                            Save
                        </Button>

                        {/* Execute Button with In-Canvas Toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#10b981',
                            borderRadius: 6,
                            padding: '0 6px 0 12px',
                            height: 32
                        }}>
                            <Button
                                type="text"
                                icon={<PlayCircleOutlined />}
                                onClick={handleExecuteClick}
                                style={{
                                    color: '#ffffff',
                                    padding: '0 8px 0 0',
                                    height: 'auto',
                                    fontWeight: 500
                                }}
                            >
                                Execute
                            </Button>
                            <div style={{
                                borderLeft: '1px solid rgba(255,255,255,0.3)',
                                paddingLeft: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }}>
                                <Tooltip title="When enabled, agents execute directly on the canvas with visual status updates">
                                    <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                                </Tooltip>
                                <Switch
                                    size="small"
                                    checked={executionMode === 'canvas'}
                                    onChange={handleExecutionModeToggle}
                                    style={{
                                        backgroundColor: executionMode === 'canvas' ? '#059669' : 'rgba(255,255,255,0.3)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Max/Min Button - Far Right */}
                        <Button
                            icon={isMaximized ? <CompressOutlined /> : <ExpandOutlined />}
                            onClick={toggleMaximized}
                        >
                            {isMaximized ? 'Min' : 'Max'}
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
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineType={ConnectionLineType.Bezier}
                    connectionLineStyle={{ stroke: '#94a3b8', strokeWidth: 2 }}
                    fitView
                    fitViewOptions={{
                        padding: 0.3,
                        includeHiddenNodes: false,
                        minZoom: 0.5,
                        maxZoom: 1.5
                    }}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    style={{
                        backgroundColor: isDarkMode ? '#171717' : '#fafafa',
                        width: '100%',
                        height: '100%'
                    }}
                    proOptions={{ hideAttribution: true }}
                    snapToGrid={true}
                    snapGrid={[15, 15]}
                >
                    <Background
                        variant="dots"
                        color={isDarkMode ? '#333333' : '#e5e5e5'}
                        gap={15}
                        size={1}
                    />
                    <Controls
                        style={{
                            backgroundColor: isDarkMode ? '#262626' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}`,
                            borderRadius: 6,
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <MiniMap
                        style={{
                            backgroundColor: isDarkMode ? '#262626' : '#ffffff',
                            border: `1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}`,
                            borderRadius: 6,
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                        nodeColor={(node) => {
                            if (node.data?.executionStatus === 'completed') return '#22c55e';
                            if (node.data?.executionStatus === 'in_progress') return '#3b82f6';
                            if (node.data?.executionStatus === 'error') return '#ef4444';
                            return isDarkMode ? '#525252' : '#d4d4d4';
                        }}
                        maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'}
                    />

                    {/* Instructions Panel - Empty State */}
                    {nodes.length === 0 && (
                        <Panel position="center">
                            <Card style={{
                                textAlign: 'center',
                                backgroundColor: isDarkMode ? '#262626' : '#ffffff',
                                border: `1px solid ${isDarkMode ? '#404040' : '#e5e5e5'}`,
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                padding: '8px'
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    backgroundColor: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <RobotOutlined style={{ fontSize: 24, color: '#ffffff' }} />
                                </div>
                                <Title level={5} style={{
                                    color: isDarkMode ? '#fafafa' : '#171717',
                                    marginBottom: 4,
                                    fontWeight: 600
                                }}>
                                    Build Your Workflow
                                </Title>
                                <Text style={{
                                    color: isDarkMode ? '#a3a3a3' : '#737373',
                                    display: 'block',
                                    marginBottom: 20,
                                    fontSize: 13
                                }}>
                                    Add agents and connect them to create a pipeline
                                </Text>
                                {selectedTeam ? (
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Button
                                            type="primary"
                                            icon={<RobotOutlined />}
                                            onClick={() => setIsTemplateDrawerOpen(true)}
                                            block
                                            style={{ borderRadius: 6 }}
                                        >
                                            Add from Nodes
                                        </Button>
                                        <Button
                                            icon={<NodeIndexOutlined />}
                                            onClick={handleLoadSampleWorkflow}
                                            block
                                            style={{
                                                borderRadius: 6,
                                                borderColor: isDarkMode ? '#404040' : '#e5e5e5'
                                            }}
                                        >
                                            Load Sample
                                        </Button>
                                    </Space>
                                ) : (
                                    <Text style={{
                                        color: isDarkMode ? '#a3a3a3' : '#737373',
                                        fontSize: 13
                                    }}>
                                        Select a team to start
                                    </Text>
                                )}
                            </Card>
                        </Panel>
                    )}
                </ReactFlow>
            </div>

            {/* Agent Form Modal */}
            <AgentFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingNode(null);
                }}
                onSave={onSaveAgent}
                form={form}
                editingNode={editingNode}
                isLoading={isLoading}
                isDarkMode={isDarkMode}
            />

            {/* Template Drawer */}
            <TemplateDrawer
                isOpen={isTemplateDrawerOpen}
                onClose={() => setIsTemplateDrawerOpen(false)}
                agentTemplates={agentTemplates}
                commonAgents={commonAgents}
                selectedTeam={selectedTeam}
                isDarkMode={isDarkMode}
                onAddAgent={onAddAgentFromTemplate}
                onAddCommonAgent={onAddCommonAgentFromDrawer}
                onViewDetails={handleViewTemplateDetails}
            />

            {/* Save Workflow Modal */}
            <SaveWorkflowModal
                isOpen={isSaveWorkflowModalOpen}
                onClose={() => {
                    setIsSaveWorkflowModalOpen(false);
                    workflowForm.resetFields();
                }}
                onSave={onSaveWorkflow}
                form={workflowForm}
                isLoading={isLoading}
                selectedTeam={selectedTeam}
                isDarkMode={isDarkMode}
            />

            {/* Template Details Modal */}
            <TemplateDetailsModal
                isOpen={isTemplateDetailsModalOpen}
                onClose={closeTemplateDetails}
                template={selectedTemplateForView}
                onAddToCanvas={addTemplateFromDetails}
                isDarkMode={isDarkMode}
            />

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
                    borderRadius: isMaximized ? 0 : 8
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
