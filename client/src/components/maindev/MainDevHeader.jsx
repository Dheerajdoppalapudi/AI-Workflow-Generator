import React from 'react';
import { Typography, Button, Select } from 'antd';
import { TeamOutlined, NodeIndexOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const MainDevHeader = ({
    isDarkMode,
    viewMode,
    selectedTeam,
    teams,
    teamsLoading,
    onTeamSelect,
    onCustomAgents
}) => {
    const getSubtitle = () => {
        if (viewMode === 'canvas') return 'Design your custom agent pipeline';
        if (viewMode === 'pipeline') return 'Your custom agent pipeline is ready';
        return selectedTeam ? selectedTeam.description : 'Select a team or create custom agents';
    };

    return (
        <div style={{
            borderBottom: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
            backgroundColor: isDarkMode ? '#111' : '#fff',
            padding: '24px 0 0 0'
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 24px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 20
                }}>
                    <div>
                        <Title level={1} style={{
                            color: isDarkMode ? '#fff' : '#1a1a1a',
                            margin: 0,
                            fontSize: 24,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            {/* <NodeIndexOutlined style={{ color: '#3b82f6' }} /> */}
                            AI Agent Framework
                        </Title>
                        <Text style={{
                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                            fontSize: 14,
                            display: 'block',
                            marginTop: 2
                        }}>
                            {getSubtitle()}
                        </Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TeamOutlined style={{
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 16
                            }} />
                            <Select
                                placeholder="Select Team"
                                value={selectedTeam?.id}
                                onChange={onTeamSelect}
                                loading={teamsLoading}
                                style={{ width: 200, height: 36 }}
                                dropdownStyle={{
                                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff'
                                }}
                            >
                                {teams.map(team => (
                                    <Option key={team.id} value={team.id}>
                                        {team.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainDevHeader;