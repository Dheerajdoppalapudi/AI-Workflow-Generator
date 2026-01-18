import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const ProgressStepper = ({
    agents,
    currentStep,
    completedSteps,
    isDarkMode,
    onStepClick
}) => {
    const getStepStatus = (index) => {
        if (completedSteps.includes(index)) return 'completed';
        if (index === currentStep) return 'active';
        const maxAccessibleStep = Math.max(...completedSteps, -1) + 1;
        if (index <= maxAccessibleStep) return 'accessible';
        return 'locked';
    };

    const getStepIcon = (agent, status, index) => {
        if (status === 'completed') {
            const IconComponent = agent.icon;
            return <IconComponent style={{ fontSize: 14 }} />;
        }
        return index + 1;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'active': return isDarkMode ? '#2563eb' : '#1d4ed8';
            default: return isDarkMode ? '#374151' : '#e5e7eb';
        }
    };

    const getStatusTextColor = (status) => {
        if (status === 'completed' || status === 'active') return '#fff';
        return isDarkMode ? '#9ca3af' : '#6b7280';
    };

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '20px 24px 0 24px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                overflowX: 'auto',
                paddingBottom: 4
            }}>
                {agents.map((agent, index) => {
                    const status = getStepStatus(index);
                    const isClickable = status !== 'locked';

                    return (
                        <React.Fragment key={agent.key}>
                            <div
                                onClick={() => isClickable && onStepClick(index)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    cursor: isClickable ? 'pointer' : 'default',
                                    opacity: status === 'locked' ? 0.4 : 1,
                                    borderRadius: 4,
                                    backgroundColor: status === 'active'
                                        ? (isDarkMode ? 'rgba(37, 99, 235, 0.1)' : 'rgba(29, 78, 216, 0.05)')
                                        : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    backgroundColor: getStatusColor(status),
                                    color: getStatusTextColor(status),
                                    borderRadius: 4
                                }}>
                                    {getStepIcon(agent, status, index)}
                                </div>
                                <Text style={{
                                    color: status === 'active'
                                        ? (isDarkMode ? '#fff' : '#1a1a1a')
                                        : status === 'completed'
                                            ? (isDarkMode ? '#d1d5db' : '#374151')
                                            : (isDarkMode ? '#6b7280' : '#9ca3af'),
                                    fontSize: 13,
                                    fontWeight: status === 'active' ? 600 : 500,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {agent.title}
                                </Text>
                            </div>
                            {index < agents.length - 1 && (
                                <div style={{
                                    width: 16,
                                    height: 1,
                                    backgroundColor: completedSteps.includes(index)
                                        ? '#10b981'
                                        : (isDarkMode ? '#374151' : '#e5e7eb'),
                                    margin: '0 4px'
                                }} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressStepper;