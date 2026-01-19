import React from 'react';
import { Drawer, List, Typography, Button, Space, Tag } from 'antd';
import { RobotOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const TemplateDrawer = ({
    isOpen,
    onClose,
    agentTemplates,
    commonAgents,
    selectedTeam,
    isDarkMode,
    onAddAgent,
    onAddCommonAgent,
    onViewDetails
}) => {
    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RobotOutlined style={{ color: '#3b82f6' }} />
                    Agent Templates
                </div>
            }
            placement="right"
            open={isOpen}
            onClose={onClose}
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
                                                onClick={() => onViewDetails(template)}
                                                style={{
                                                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                                                }}
                                            />
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={() => onAddAgent(template)}
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
                                                        onClick={() => onViewDetails(commonAgent)}
                                                        style={{
                                                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                                                        }}
                                                    />
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => onAddCommonAgent(commonAgent)}
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
    );
};

export default TemplateDrawer;
