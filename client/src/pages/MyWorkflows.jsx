import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Empty, Spin, message, Typography, Button, Popconfirm, Table, Tag, Collapse, Space, Tooltip } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    FolderOpenOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    NodeIndexOutlined,
    CaretRightOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { workflowServices, sdGenServices } from '../api/apiEndpoints';

const { Title, Text } = Typography;

const MyWorkflows = () => {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isDarkMode = theme === 'dark';

    const [workflows, setWorkflows] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTeams, setExpandedTeams] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch workflows and teams in parallel
            const [workflowsResult, teamsResult] = await Promise.all([
                workflowServices.getWorkflows(token),
                sdGenServices.getTeams()
            ]);

            // Process workflows
            if (workflowsResult.success && workflowsResult.data) {
                const workflowsList = workflowsResult.data.data?.workflows || workflowsResult.data.workflows || [];
                setWorkflows(workflowsList);

                // Auto-expand all teams that have workflows
                const teamIds = [...new Set(workflowsList.map(w => w.teamId || 'no-team'))];
                setExpandedTeams(teamIds.map(id => String(id)));
            } else {
                message.error(workflowsResult.error || 'Failed to load workflows');
            }

            // Process teams
            if (teamsResult.success && teamsResult.teams) {
                setTeams(teamsResult.teams);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorkflow = async (workflowId, e) => {
        e?.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const result = await workflowServices.deleteWorkflow(workflowId, token);

            if (result.success) {
                message.success('Workflow deleted successfully');
                fetchData();
            } else {
                message.error('Failed to delete workflow');
            }
        } catch (error) {
            console.error('Error deleting workflow:', error);
            message.error('Failed to delete workflow');
        }
    };

    const handleOpenWorkflow = (workflow) => {
        navigate('/maindev', { state: { workflow } });
    };

    const handleCreateNew = () => {
        navigate('/maindev');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAgentCount = (workflow) => {
        try {
            const data = typeof workflow.workflowData === 'string'
                ? JSON.parse(workflow.workflowData)
                : workflow.workflowData;
            return data?.agents?.length || 0;
        } catch {
            return 0;
        }
    };

    const getTeamName = (teamId) => {
        if (!teamId) return 'Unassigned';
        const team = teams.find(t => t.id === teamId);
        return team?.name || `Team ${teamId}`;
    };

    // Group workflows by team
    const groupedWorkflows = workflows.reduce((acc, workflow) => {
        const teamId = workflow.teamId || 'no-team';
        if (!acc[teamId]) {
            acc[teamId] = [];
        }
        acc[teamId].push(workflow);
        return acc;
    }, {});

    // Sort teams: teams with workflows first, then by name
    const sortedTeamIds = Object.keys(groupedWorkflows).sort((a, b) => {
        if (a === 'no-team') return 1;
        if (b === 'no-team') return -1;
        return getTeamName(parseInt(a)).localeCompare(getTeamName(parseInt(b)));
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: isDarkMode ? '#1f2937' : '#f0f5ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <NodeIndexOutlined style={{
                            fontSize: 18,
                            color: '#3b82f6'
                        }} />
                    </div>
                    <div>
                        <Text strong style={{
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            display: 'block'
                        }}>
                            {text}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.description || 'No description'}
                        </Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Agents',
            key: 'agents',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Tag color="blue" style={{ margin: 0 }}>
                    {getAgentCount(record)} agents
                </Tag>
            )
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            render: (date) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ClockCircleOutlined style={{
                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                        fontSize: 12
                    }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {formatDate(date)}
                    </Text>
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Open Workflow">
                        <Button
                            type="primary"
                            size="small"
                            icon={<FolderOpenOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWorkflow(record);
                            }}
                        >
                            Open
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Delete Workflow"
                        description="Are you sure you want to delete this workflow?"
                        onConfirm={(e) => handleDeleteWorkflow(record.id, e)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const getCollapseItems = () => {
        return sortedTeamIds.map(teamId => {
            const teamWorkflows = groupedWorkflows[teamId];
            const teamName = teamId === 'no-team' ? 'Unassigned' : getTeamName(parseInt(teamId));

            return {
                key: String(teamId),
                label: (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '4px 0'
                    }}>
                        <TeamOutlined style={{
                            fontSize: 18,
                            color: teamId === 'no-team' ? '#9ca3af' : '#10b981'
                        }} />
                        <span style={{
                            fontWeight: 600,
                            color: isDarkMode ? '#f3f4f6' : '#1f2937'
                        }}>
                            {teamName}
                        </span>
                        <Tag
                            color={isDarkMode ? 'default' : 'processing'}
                            style={{ marginLeft: 'auto' }}
                        >
                            {teamWorkflows.length} workflow{teamWorkflows.length !== 1 ? 's' : ''}
                        </Tag>
                    </div>
                ),
                children: (
                    <Table
                        dataSource={teamWorkflows}
                        columns={columns}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        onRow={(record) => ({
                            onClick: () => handleOpenWorkflow(record),
                            style: { cursor: 'pointer' }
                        })}
                        style={{
                            backgroundColor: 'transparent'
                        }}
                    />
                ),
                style: {
                    marginBottom: 16,
                    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                    borderRadius: 12,
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    overflow: 'hidden'
                }
            };
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: isDarkMode ? '#0a0a0a' : '#fafbfc',
            padding: '32px'
        }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                }}>
                    <div>
                        <Title level={2} style={{
                            margin: 0,
                            color: isDarkMode ? '#ffffff' : '#000000'
                        }}>
                            My Workflows
                        </Title>
                        <Text type="secondary">
                            Manage and organize your workflow designs
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={handleCreateNew}
                        style={{
                            background: '#1890ff',
                            borderColor: '#1890ff'
                        }}
                    >
                        Create New Workflow
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px'
                    }}>
                        <Spin size="large" tip="Loading workflows..." />
                    </div>
                ) : workflows.length === 0 ? (
                    <div
                        style={{
                            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                            borderColor: isDarkMode ? '#303030' : '#d9d9d9',
                            border: `1px solid ${isDarkMode ? '#303030' : '#d9d9d9'}`,
                            borderRadius: 12,
                            textAlign: 'center',
                            padding: '80px 20px'
                        }}
                    >
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <Text style={{
                                        fontSize: '16px',
                                        color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'
                                    }}>
                                        No workflows yet
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                        Create your first workflow to get started
                                    </Text>
                                </div>
                            }
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={handleCreateNew}
                                style={{ marginTop: '16px' }}
                            >
                                Create Workflow
                            </Button>
                        </Empty>
                    </div>
                ) : (
                    <Collapse
                        activeKey={expandedTeams}
                        onChange={setExpandedTeams}
                        expandIcon={({ isActive }) => (
                            <CaretRightOutlined
                                rotate={isActive ? 90 : 0}
                                style={{
                                    fontSize: 12,
                                    color: isDarkMode ? '#9ca3af' : '#6b7280'
                                }}
                            />
                        )}
                        ghost
                        items={getCollapseItems()}
                        style={{
                            backgroundColor: 'transparent'
                        }}
                    />
                )}

                {/* Summary */}
                {!loading && workflows.length > 0 && (
                    <div style={{
                        marginTop: 24,
                        padding: '16px 20px',
                        backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                        borderRadius: 8,
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Text type="secondary">
                            Total: <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {workflows.length}
                            </Text> workflow{workflows.length !== 1 ? 's' : ''} across{' '}
                            <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>
                                {sortedTeamIds.length}
                            </Text> team{sortedTeamIds.length !== 1 ? 's' : ''}
                        </Text>
                        <Space>
                            <Button
                                size="small"
                                onClick={() => setExpandedTeams(sortedTeamIds.map(String))}
                            >
                                Expand All
                            </Button>
                            <Button
                                size="small"
                                onClick={() => setExpandedTeams([])}
                            >
                                Collapse All
                            </Button>
                        </Space>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyWorkflows;
