import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    Panel
} from 'reactflow';
import {
    Typography,
    Button,
    Card,
    Space,
    Form,
    Spin
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    PlayCircleOutlined,
    NodeIndexOutlined,
    RobotOutlined
} from '@ant-design/icons';

import 'reactflow/dist/style.css';

// Import subcomponents
import { nodeTypes } from './canvas/AgentNode';
import { AgentFormModal, SaveWorkflowModal, TemplateDetailsModal } from './canvas/AgentModals';
import TemplateDrawer from './canvas/TemplateDrawer';
import useAgentCanvas from './canvas/useAgentCanvas';

const { Title, Text } = Typography;

const AgentCanvasDesigner = ({ onComplete, isDarkMode, initialAgentData = null, selectedTeam = null, onAgentsUpdated = null }) => {
    // Modal/Drawer states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
    const [isSaveWorkflowModalOpen, setIsSaveWorkflowModalOpen] = useState(false);
    const [isTemplateDetailsModalOpen, setIsTemplateDetailsModalOpen] = useState(false);
    const [selectedTemplateForView, setSelectedTemplateForView] = useState(null);

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

    return (
        <div style={{
            height: '75vh',
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
                            onClick={openAddAgentModal}
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

                    {/* Instructions Panel - Empty State */}
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
