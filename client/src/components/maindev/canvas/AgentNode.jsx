import React, { useContext } from 'react';
import { Handle, Position } from 'reactflow';
import { Typography, Button } from 'antd';
import { RobotOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../../context/ThemeContext';

const { Text } = Typography;

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
                {data.description && data.description.length > 50
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

export const nodeTypes = {
    agentNode: AgentNode,
};

export default AgentNode;
