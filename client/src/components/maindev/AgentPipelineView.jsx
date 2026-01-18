import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Typography, Button, Card, Progress, Tag, Tooltip, Modal, message } from 'antd';
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RobotOutlined,
    ArrowRightOutlined,
    EditOutlined,
    EyeOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const AgentCard = ({ agent, isActive, isCompleted, isNext, isDarkMode, onStart, onView, onEdit }) => {
    const getStatusInfo = () => {
        if (isCompleted) {
            return {
                status: 'completed',
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.1)',
                icon: <CheckCircleOutlined />,
                text: 'Completed'
            };
        }
        if (isActive) {
            return {
                status: 'active',
                color: '#3b82f6',
                bg: 'rgba(59, 130, 246, 0.1)',
                icon: <PlayCircleOutlined />,
                text: 'Running'
            };
        }
        if (isNext) {
            return {
                status: 'next',
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.1)',
                icon: <ClockCircleOutlined />,
                text: 'Ready'
            };
        }
        return {
            status: 'pending',
            color: isDarkMode ? '#6b7280' : '#9ca3af',
            bg: isDarkMode ? 'rgba(107, 114, 128, 0.1)' : 'rgba(156, 163, 175, 0.1)',
            icon: <ClockCircleOutlined />,
            text: 'Pending'
        };
    };

    const statusInfo = getStatusInfo();

    return (
        <Card
            style={{
                width: 280,
                height: 320,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `2px solid ${isActive ? statusInfo.color : (isDarkMode ? '#374151' : '#e5e7eb')}`,
                borderRadius: 12,
                boxShadow: isActive
                    ? `0 8px 32px rgba(59, 130, 246, 0.2)`
                    : '0 4px 16px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            bodyStyle={{ padding: 0 }}
        >
            {/* Status Bar */}
            <div style={{
                height: 4,
                backgroundColor: statusInfo.color,
                opacity: isActive ? 1 : 0.6
            }} />

            {/* Card Content */}
            <div style={{ padding: '20px 24px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: statusInfo.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: statusInfo.color,
                        fontSize: 18
                    }}>
                        <RobotOutlined />
                    </div>

                    <Tag
                        color={statusInfo.status === 'completed' ? 'success' :
                               statusInfo.status === 'active' ? 'blue' :
                               statusInfo.status === 'next' ? 'warning' : 'default'}
                        style={{
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}
                    >
                        {statusInfo.text}
                    </Tag>
                </div>

                {/* Agent Info */}
                <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{
                        margin: 0,
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.2,
                        marginBottom: 8
                    }}>
                        {agent.name}
                    </Title>
                    <Text style={{
                        color: isDarkMode ? '#d1d5db' : '#6b7280',
                        fontSize: 13,
                        lineHeight: 1.4,
                        display: 'block'
                    }}>
                        {agent.description.length > 80
                            ? `${agent.description.substring(0, 80)}...`
                            : agent.description}
                    </Text>
                </div>

                {/* Progress or Actions */}
                {isActive && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                        }}>
                            <Text style={{
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 12,
                                fontWeight: 500
                            }}>
                                Processing...
                            </Text>
                            <Text style={{
                                color: statusInfo.color,
                                fontSize: 12,
                                fontWeight: 600
                            }}>
                                Running
                            </Text>
                        </div>
                        <Progress
                            percent={Math.random() * 100} // Simulate progress
                            strokeColor={statusInfo.color}
                            trailColor={isDarkMode ? '#374151' : '#e5e7eb'}
                            size="small"
                            showInfo={false}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 'auto'
                }}>
                    {(isNext || !isActive) && (
                        <Button
                            type={isNext ? "primary" : "default"}
                            icon={<PlayCircleOutlined />}
                            onClick={() => onStart(agent.id)}
                            disabled={!isNext && !isCompleted}
                            size="small"
                            style={{
                                flex: 1,
                                backgroundColor: isNext ? statusInfo.color : undefined,
                                borderColor: isNext ? statusInfo.color : undefined
                            }}
                        >
                            {isNext ? 'Start' : 'Start'}
                        </Button>
                    )}

                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => onView(agent)}
                            size="small"
                        />
                    </Tooltip>

                    <Tooltip title="Edit Agent">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => onEdit(agent)}
                            size="small"
                        />
                    </Tooltip>
                </div>
            </div>

            {/* Connection Line */}
            {/* We'll add this when connecting agents */}
        </Card>
    );
};

const ConnectionArrow = ({ isDarkMode }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 2,
        position: 'relative'
    }}>
        <div style={{
            width: '100%',
            height: 2,
            backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderRadius: 1
        }} />
        <ArrowRightOutlined style={{
            position: 'absolute',
            right: -8,
            color: isDarkMode ? '#6b7280' : '#9ca3af',
            fontSize: 14,
            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
            padding: '4px 2px'
        }} />
    </div>
);

const AgentPipelineView = ({ agentData, onEdit, onBack, isDarkMode }) => {
    const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
    const [completedAgents, setCompletedAgents] = useState([]);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

    const { agents = [], connections = [] } = agentData || {};

    const handleStartAgent = (agentId) => {
        const agentIndex = agents.findIndex(agent => agent.id === agentId);
        if (agentIndex !== -1) {
            setCurrentAgentIndex(agentIndex);
            message.success(`Started ${agents[agentIndex].name}`);
        }
    };

    const handleViewAgent = (agent) => {
        setSelectedAgent(agent);
        setDetailsModalOpen(true);
    };

    const handleEditAgent = (agent) => {
        onEdit(agent);
    };

    const isAgentCompleted = (index) => completedAgents.includes(index);
    const isAgentActive = (index) => index === currentAgentIndex;
    const isAgentNext = (index) => index === currentAgentIndex + 1;

    if (!agentData || agents.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: 60,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                borderRadius: 8,
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
            }}>
                <RobotOutlined style={{
                    fontSize: 48,
                    color: isDarkMode ? '#6b7280' : '#9ca3af',
                    marginBottom: 16
                }} />
                <Title level={3} style={{
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    marginBottom: 8
                }}>
                    No Agent Pipeline Found
                </Title>
                <Text style={{
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    marginBottom: 24,
                    display: 'block'
                }}>
                    Please design your agent pipeline first using the canvas designer.
                </Text>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={onBack}
                >
                    Go to Designer
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                marginBottom: 32,
                textAlign: 'center'
            }}>
                <Title level={2} style={{
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 600,
                    marginBottom: 8
                }}>
                    AI Agent Pipeline
                </Title>
                <Text style={{
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 16
                }}>
                    Your custom agent workflow with {agents.length} agents
                </Text>
            </div>

            {/* Overall Progress */}
            <div style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: 8,
                padding: 20,
                marginBottom: 32
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                }}>
                    <Text strong style={{
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        fontSize: 14
                    }}>
                        Pipeline Progress
                    </Text>
                    <Text style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 14
                    }}>
                        {completedAgents.length} of {agents.length} completed
                    </Text>
                </div>
                <Progress
                    percent={(completedAgents.length / agents.length) * 100}
                    strokeColor="#10b981"
                    trailColor={isDarkMode ? '#374151' : '#e5e7eb'}
                    showInfo={false}
                />
            </div>

            {/* Agents Display */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                gap: 20,
                flexWrap: 'nowrap',
                padding: '20px 0',
                overflowX: 'auto',
                minHeight: 360
            }}>
                {agents.map((agent, index) => (
                    <React.Fragment key={agent.id}>
                        <AgentCard
                            agent={agent}
                            isActive={isAgentActive(index)}
                            isCompleted={isAgentCompleted(index)}
                            isNext={isAgentNext(index)}
                            isDarkMode={isDarkMode}
                            onStart={handleStartAgent}
                            onView={handleViewAgent}
                            onEdit={handleEditAgent}
                        />
                        {index < agents.length - 1 && (
                            <ConnectionArrow isDarkMode={isDarkMode} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                marginTop: 40
            }}>
                <Button
                    icon={<EditOutlined />}
                    onClick={onBack}
                    size="large"
                >
                    Edit Pipeline
                </Button>
                <Button
                    type="primary"
                    icon={<SettingOutlined />}
                    size="large"
                >
                    Pipeline Settings
                </Button>
            </div>

            {/* Agent Details Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RobotOutlined style={{ color: '#3b82f6' }} />
                        {selectedAgent?.name}
                    </div>
                }
                open={detailsModalOpen}
                onCancel={() => setDetailsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsModalOpen(false)}>
                        Close
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setDetailsModalOpen(false);
                            handleEditAgent(selectedAgent);
                        }}
                    >
                        Edit Agent
                    </Button>
                ]}
                width={600}
            >
                {selectedAgent && (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                display: 'block',
                                marginBottom: 8
                            }}>
                                Description
                            </Text>
                            <Text style={{
                                color: isDarkMode ? '#d1d5db' : '#6b7280',
                                lineHeight: 1.6
                            }}>
                                {selectedAgent.description}
                            </Text>
                        </div>

                        <div>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                display: 'block',
                                marginBottom: 8
                            }}>
                                Agent Prompt
                            </Text>
                            <div style={{
                                backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                borderRadius: 6,
                                padding: 12,
                                fontFamily: 'monospace',
                                fontSize: 13,
                                color: isDarkMode ? '#d1d5db' : '#374151',
                                lineHeight: 1.5
                            }}>
                                {selectedAgent.prompt}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AgentPipelineView;