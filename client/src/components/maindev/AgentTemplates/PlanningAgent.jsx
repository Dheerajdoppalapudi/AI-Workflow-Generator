import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { AuthContext } from '../../../context/AuthContext';
import { Typography, Button, Card, Input, Select, message, Collapse, Divider, Tag } from 'antd';
import {
    ProjectOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    CaretRightOutlined
} from '@ant-design/icons';
import { planningServices } from '../../../api/apiEndpoints';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const PlanningAgent = ({ isActive, onComplete, onNext, onPrevious, enhancedDescription }) => {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const isDarkMode = theme === 'dark';

    // State management
    const [planningData, setPlanningData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingStepId, setEditingStepId] = useState(null);
    const [editingSubstepId, setEditingSubstepId] = useState(null);

    useEffect(() => {
        // Auto-generate planning when component is active and has enhanced description
        if (isActive && enhancedDescription && !planningData) {
            generateInitialPlanning();
        }
    }, [isActive, enhancedDescription]);

    const generateInitialPlanning = async () => {
        if (!enhancedDescription) {
            message.error('Enhanced description is required for planning generation');
            return;
        }

        setIsLoading(true);

        try {
            let token = user?.token;
            if (!token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    token = parsedUser?.token;
                }
            }

            if (!token) {
                token = localStorage.getItem('token');
            }

            if (!token) {
                message.error('Authentication token not found. Please log in again.');
                return;
            }

            const response = await planningServices.generateInitialPlanning({
                enhancedText: enhancedDescription,
                requirementId: null // You might want to pass this from parent
            }, token);

            if (response.success) {
                setPlanningData(response.data.planningData);
                message.success('Initial planning generated successfully!');
            } else {
                throw new Error(response.error || 'Failed to generate planning');
            }
        } catch (error) {
            console.error('Error generating planning:', error);
            message.error(error.message || 'Failed to generate planning');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStepEdit = (stepId, field, value) => {
        setPlanningData(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === stepId
                    ? { ...step, [field]: value }
                    : step
            )
        }));
    };

    const handleSubstepEdit = (stepId, substepId, field, value) => {
        setPlanningData(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === stepId
                    ? {
                        ...step,
                        substeps: step.substeps.map(substep =>
                            substep.id === substepId
                                ? { ...substep, [field]: value }
                                : substep
                        )
                    }
                    : step
            )
        }));
    };

    const addNewStep = () => {
        const newStep = {
            id: `step-${Date.now()}`,
            title: "New Step",
            description: "Step description",
            estimatedTime: "1 week",
            priority: "Medium",
            substeps: []
        };

        setPlanningData(prev => ({
            ...prev,
            steps: [...prev.steps, newStep]
        }));
    };

    const addNewSubstep = (stepId) => {
        const newSubstep = {
            id: `substep-${stepId}-${Date.now()}`,
            title: "New Substep",
            description: "Substep description",
            estimatedTime: "2 days",
            assignee: "Team Member",
            status: "pending"
        };

        setPlanningData(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === stepId
                    ? { ...step, substeps: [...step.substeps, newSubstep] }
                    : step
            )
        }));
    };

    const deleteStep = (stepId) => {
        setPlanningData(prev => ({
            ...prev,
            steps: prev.steps.filter(step => step.id !== stepId)
        }));
    };

    const deleteSubstep = (stepId, substepId) => {
        setPlanningData(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === stepId
                    ? {
                        ...step,
                        substeps: step.substeps.filter(substep => substep.id !== substepId)
                    }
                    : step
            )
        }));
    };

    const renderStep = (step, stepIndex) => {
        const isEditingStep = editingStepId === step.id;

        return (
            <Panel
                header={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {step.title}
                            </Text>
                            <Tag color={step.priority === 'High' ? 'red' : step.priority === 'Medium' ? 'orange' : 'green'}>
                                {step.priority}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {step.estimatedTime}
                            </Text>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                size="small"
                                icon={isEditingStep ? <SaveOutlined /> : <EditOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingStepId(isEditingStep ? null : step.id);
                                }}
                            />
                            <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStep(step.id);
                                }}
                                danger
                            />
                        </div>
                    </div>
                }
                key={step.id}
                style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                }}
            >
                {isEditingStep ? (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 12 }}>
                            <Text strong>Title:</Text>
                            <Input
                                value={step.title}
                                onChange={(e) => handleStepEdit(step.id, 'title', e.target.value)}
                                style={{ marginTop: 4 }}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <Text strong>Description:</Text>
                            <TextArea
                                value={step.description}
                                onChange={(e) => handleStepEdit(step.id, 'description', e.target.value)}
                                rows={2}
                                style={{ marginTop: 4 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                                <Text strong>Estimated Time:</Text>
                                <Input
                                    value={step.estimatedTime}
                                    onChange={(e) => handleStepEdit(step.id, 'estimatedTime', e.target.value)}
                                    style={{ marginTop: 4 }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text strong>Priority:</Text>
                                <Select
                                    value={step.priority}
                                    onChange={(value) => handleStepEdit(step.id, 'priority', value)}
                                    style={{ width: '100%', marginTop: 4 }}
                                >
                                    <Option value="High">High</Option>
                                    <Option value="Medium">Medium</Option>
                                    <Option value="Low">Low</Option>
                                </Select>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom: 16 }}>
                        <Text style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                            {step.description}
                        </Text>
                    </div>
                )}

                <Divider orientation="left">Substeps</Divider>

                <div style={{ marginLeft: 20 }}>
                    {step.substeps.map((substep, substepIndex) => {
                        const isEditingSubstep = editingSubstepId === substep.id;

                        return (
                            <Card
                                key={substep.id}
                                size="small"
                                style={{
                                    marginBottom: 8,
                                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                                    borderColor: isDarkMode ? '#4b5563' : '#d1d5db'
                                }}
                                extra={
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <Button
                                            size="small"
                                            icon={isEditingSubstep ? <SaveOutlined /> : <EditOutlined />}
                                            onClick={() => setEditingSubstepId(isEditingSubstep ? null : substep.id)}
                                        />
                                        <Button
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => deleteSubstep(step.id, substep.id)}
                                            danger
                                        />
                                    </div>
                                }
                            >
                                {isEditingSubstep ? (
                                    <div>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>Title:</Text>
                                            <Input
                                                value={substep.title}
                                                onChange={(e) => handleSubstepEdit(step.id, substep.id, 'title', e.target.value)}
                                                size="small"
                                                style={{ marginTop: 2 }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>Description:</Text>
                                            <TextArea
                                                value={substep.description}
                                                onChange={(e) => handleSubstepEdit(step.id, substep.id, 'description', e.target.value)}
                                                rows={2}
                                                size="small"
                                                style={{ marginTop: 2 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <Text strong>Time:</Text>
                                                <Input
                                                    value={substep.estimatedTime}
                                                    onChange={(e) => handleSubstepEdit(step.id, substep.id, 'estimatedTime', e.target.value)}
                                                    size="small"
                                                    style={{ marginTop: 2 }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <Text strong>Assignee:</Text>
                                                <Input
                                                    value={substep.assignee}
                                                    onChange={(e) => handleSubstepEdit(step.id, substep.id, 'assignee', e.target.value)}
                                                    size="small"
                                                    style={{ marginTop: 2 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                            {substep.title}
                                        </Text>
                                        <br />
                                        <Text style={{ color: isDarkMode ? '#d1d5db' : '#374151', fontSize: 13 }}>
                                            {substep.description}
                                        </Text>
                                        <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                ⏱️ {substep.estimatedTime}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                👤 {substep.assignee}
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => addNewSubstep(step.id)}
                        style={{ width: '100%', marginTop: 8 }}
                    >
                        Add Substep
                    </Button>
                </div>
            </Panel>
        );
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <ProjectOutlined style={{ fontSize: 48, color: isDarkMode ? '#3b7bd5' : '#2563eb' }} />
                <Title level={4} style={{ color: isDarkMode ? '#fff' : '#000', marginTop: 16 }}>
                    Generating Project Plan...
                </Title>
                <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                    AI is analyzing your requirements and creating a comprehensive project plan
                </Text>
            </div>
        );
    }

    if (!planningData && !enhancedDescription) {
        return (
            <div>
                <div style={{ marginBottom: '32px' }}>
                    <Title
                        level={3}
                        style={{
                            color: isDarkMode ? '#fff' : '#000',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <ProjectOutlined style={{
                            color: isDarkMode ? '#3b7bd5' : '#2563eb',
                            fontSize: '24px',
                        }} />
                        Planning Agent
                    </Title>
                    <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '16px' }}>
                        Please complete the Requirements Analysis first to generate a project plan.
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <Title
                    level={3}
                    style={{
                        color: isDarkMode ? '#fff' : '#000',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <ProjectOutlined style={{
                        color: isDarkMode ? '#3b7bd5' : '#2563eb',
                        fontSize: '24px',
                    }} />
                    Planning Agent
                </Title>
                <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '16px' }}>
                    AI-generated project plan with editable steps and substeps
                </Text>
            </div>

            {planningData && (
                <div>
                    {/* Project Overview */}
                    <Card
                        style={{
                            marginBottom: 24,
                            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                            borderColor: isDarkMode ? '#374151' : '#e5e7eb'
                        }}
                    >
                        <Title level={4} style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                            {planningData.projectTitle}
                        </Title>
                        <Text style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>
                            {planningData.overview}
                        </Text>
                        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                            <Text strong style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                Duration: {planningData.estimatedDuration}
                            </Text>
                            <Text strong style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                Steps: {planningData.steps.length}
                            </Text>
                        </div>
                    </Card>

                    {/* Project Steps */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', margin: 0 }}>
                                Project Steps
                            </Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addNewStep}
                            >
                                Add Step
                            </Button>
                        </div>

                        <Collapse
                            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                            style={{
                                backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                                borderColor: isDarkMode ? '#374151' : '#d1d5db'
                            }}
                        >
                            {planningData.steps.map((step, index) => renderStep(step, index))}
                        </Collapse>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                        <Button
                            onClick={() => generateInitialPlanning()}
                            loading={isLoading}
                        >
                            Regenerate Plan
                        </Button>
                        <Button
                            type="primary"
                            onClick={onComplete}
                            size="large"
                        >
                            Complete Planning
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanningAgent;