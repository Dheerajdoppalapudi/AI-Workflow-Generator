import React from 'react';
import { Typography, Button, Modal } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TeamAgentView = ({
    currentAgent,
    currentStep,
    agents,
    completedSteps,
    agentData,
    isDarkMode,
    isCurrentStepCompleted,
    isLastStep,
    onCompleteStep,
    onNext,
    onPrevious,
    onAgentComplete
}) => {
    const CurrentComponent = currentAgent?.component;

    const getRunningStatus = () => {
        if (isCurrentStepCompleted) return { text: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
        return { text: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    };

    const runningStatus = getRunningStatus();

    return (
        <div style={{
            backgroundColor: isDarkMode ? '#111' : '#fff',
            border: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
            borderRadius: 8,
            marginBottom: 24,
            overflow: 'hidden'
        }}>
            {/* Agent Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                            borderRadius: 8
                        }}>
                            {currentAgent && React.createElement(currentAgent.icon, {
                                style: { fontSize: 20, color: '#fff' }
                            })}
                        </div>

                        <div>
                            <Title level={3} style={{
                                color: isDarkMode ? '#fff' : '#1a1a1a',
                                margin: 0,
                                fontSize: 18,
                                fontWeight: 600,
                                lineHeight: 1.2
                            }}>
                                {currentAgent?.title}
                            </Title>
                            <Text style={{
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 14,
                                lineHeight: 1.3
                            }}>
                                {currentAgent?.description}
                            </Text>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            padding: '4px 12px',
                            backgroundColor: runningStatus.bg,
                            color: runningStatus.color,
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            borderRadius: 4
                        }}>
                            {runningStatus.text}
                        </div>

                        <Text style={{
                            color: isDarkMode ? '#6b7280' : '#9ca3af',
                            fontSize: 13,
                            fontWeight: 500
                        }}>
                            {currentStep + 1} / {agents.length}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Agent Component */}
            <div style={{
                padding: 32,
                minHeight: 400
            }}>
                {CurrentComponent && (
                    <CurrentComponent
                        isActive={true}
                        enhancedDescription={agentData.enhancedDescription}
                        planningData={agentData.planningData}
                        onComplete={onAgentComplete}
                        onNext={onNext}
                        onPrevious={onPrevious}
                    />
                )}
            </div>

            {/* Navigation Controls */}
            <div style={{
                padding: '20px 32px',
                borderTop: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Button
                    onClick={() => currentStep > 0 && onPrevious()}
                    disabled={currentStep === 0}
                    style={{
                        borderColor: isDarkMode ? '#374151' : '#d1d5db',
                        color: isDarkMode ? '#d1d5db' : '#6b7280'
                    }}
                >
                    Previous
                </Button>

                <div style={{ display: 'flex', gap: 12 }}>
                    {!isCurrentStepCompleted && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={onCompleteStep}
                            size="large"
                            style={{
                                backgroundColor: '#10b981',
                                borderColor: '#10b981'
                            }}
                        >
                            Complete Step
                        </Button>
                    )}

                    {isCurrentStepCompleted && !isLastStep && (
                        <Button
                            type="primary"
                            icon={<ArrowRightOutlined />}
                            onClick={onNext}
                            size="large"
                            style={{
                                backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                                borderColor: isDarkMode ? '#2563eb' : '#1d4ed8'
                            }}
                        >
                            Next Agent
                        </Button>
                    )}

                    {isCurrentStepCompleted && isLastStep && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            size="large"
                            style={{
                                backgroundColor: '#10b981',
                                borderColor: '#10b981'
                            }}
                        >
                            Pipeline Complete
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamAgentView;