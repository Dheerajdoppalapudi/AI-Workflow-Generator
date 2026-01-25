import React, { useContext } from 'react';
import { Handle, Position } from 'reactflow';
import { Typography, Button, Tooltip } from 'antd';
import {
    RobotOutlined,
    EditOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    LoadingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../../context/ThemeContext';

const { Text } = Typography;

// Execution status configuration
const executionStatusConfig = {
    not_started: {
        color: '#6b7280',
        bgColor: '#f3f4f6',
        darkBgColor: '#374151',
        icon: ClockCircleOutlined,
        label: 'Not Started'
    },
    in_progress: {
        color: '#3b82f6',
        bgColor: '#dbeafe',
        darkBgColor: '#1e3a5f',
        icon: LoadingOutlined,
        label: 'In Progress',
        pulse: true
    },
    completed: {
        color: '#10b981',
        bgColor: '#d1fae5',
        darkBgColor: '#064e3b',
        icon: CheckCircleOutlined,
        label: 'Completed'
    },
    error: {
        color: '#ef4444',
        bgColor: '#fee2e2',
        darkBgColor: '#7f1d1d',
        icon: CloseCircleOutlined,
        label: 'Error'
    }
};

const AgentNode = ({ data, selected }) => {
    const { theme } = useContext(ThemeContext);
    const isDarkMode = theme === 'dark';

    const executionStatus = data.executionStatus || 'not_started';
    const statusConfig = executionStatusConfig[executionStatus];
    const StatusIcon = statusConfig.icon;

    // Check if this is a common agent (purple theme)
    const isCommonAgent = data.isCommonAgent || false;

    // Theme colors based on agent type
    const themeColor = isCommonAgent ? '#8b5cf6' : '#3b82f6'; // Purple for common, Blue for regular
    const themeGradient = isCommonAgent
        ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    const themeShadow = isCommonAgent
        ? '0 2px 8px rgba(139, 92, 246, 0.3)'
        : '0 2px 8px rgba(59, 130, 246, 0.3)';

    // Handle double click to edit
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        data.onEdit?.();
    };

    return (
        <div
            onDoubleClick={handleDoubleClick}
            style={{
                minWidth: 260,
                maxWidth: 300,
                borderRadius: 12,
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `2px solid ${selected ? themeColor : (isDarkMode ? '#374151' : '#e5e7eb')}`,
                boxShadow: selected
                    ? `0 8px 25px ${isCommonAgent ? 'rgba(139, 92, 246, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`
                    : isDarkMode
                        ? '0 4px 15px rgba(0, 0, 0, 0.3)'
                        : '0 4px 15px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
        >
            {/* Execution Status Bar */}
            {data.showExecutionStatus && (
                <div style={{
                    padding: '6px 12px',
                    backgroundColor: isDarkMode ? statusConfig.darkBgColor : statusConfig.bgColor,
                    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                }}>
                    <StatusIcon
                        style={{
                            color: statusConfig.color,
                            fontSize: 12,
                            animation: statusConfig.pulse ? 'pulse 1.5s infinite' : 'none'
                        }}
                        spin={executionStatus === 'in_progress'}
                    />
                    <Text style={{
                        color: statusConfig.color,
                        fontSize: 11,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {statusConfig.label}
                    </Text>
                </div>
            )}

            {/* Left Handle - INPUT (target) */}
            <Handle
                type="target"
                position={Position.Left}
                id="left"
                style={{
                    background: themeColor,
                    width: 12,
                    height: 12,
                    border: '2px solid #ffffff',
                    left: -7,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            />

            {/* Title Section with Background */}
            <div style={{
                padding: '10px 14px',
                backgroundColor: isDarkMode
                    ? (isCommonAgent ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)')
                    : (isCommonAgent ? 'rgba(139, 92, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)'),
                display: 'flex',
                alignItems: 'center',
                gap: 10
            }}>
                <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    background: themeGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: themeShadow,
                    flexShrink: 0
                }}>
                    <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{
                        color: isDarkMode ? '#f3f4f6' : '#1f2937',
                        fontSize: 13,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {data.name}
                    </Text>
                    {isCommonAgent && (
                        <Text style={{
                            color: '#8b5cf6',
                            fontSize: 9,
                            fontWeight: 500,
                            textTransform: 'uppercase'
                        }}>
                            Common Agent
                        </Text>
                    )}
                </div>
            </div>

            {/* Full Width Divider */}
            <div style={{
                height: 1,
                backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
                width: '100%'
            }} />

            {/* Content Section */}
            <div style={{ padding: '12px 14px' }}>
                {/* Description */}
                <Text style={{
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 13,
                    display: 'block',
                    lineHeight: 1.5,
                    minHeight: 40
                }}>
                    {data.description && data.description.length > 80
                        ? `${data.description.substring(0, 80)}...`
                        : data.description || 'No description'}
                </Text>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {/* Edit Button */}
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onEdit?.();
                            }}
                            style={{
                                height: 30,
                                paddingLeft: 10,
                                paddingRight: 10,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                borderColor: isDarkMode ? '#4b5563' : '#d1d5db'
                            }}
                        >
                            Edit
                        </Button>

                        {/* Execute Button */}
                        <Button
                            type="primary"
                            size="small"
                            icon={<ThunderboltOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onExecute?.();
                            }}
                            style={{
                                height: 30,
                                paddingLeft: 10,
                                paddingRight: 10,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: '#10b981',
                                borderColor: '#10b981'
                            }}
                        >
                            Execute
                        </Button>
                    </div>

                    {/* Delete Button - Far Right */}
                    <Tooltip title="Delete Agent">
                        <Button
                            size="small"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                data.onDelete?.();
                            }}
                            style={{
                                height: 30,
                                width: 30,
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </Tooltip>
                </div>
            </div>

            {/* Right Handle - OUTPUT (source) */}
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                style={{
                    background: '#10b981',
                    width: 12,
                    height: 12,
                    border: '2px solid #ffffff',
                    right: -7,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            />
        </div>
    );
};

export const nodeTypes = {
    agentNode: AgentNode,
};

export default AgentNode;
