import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Empty, Spin, message, Typography, Button, Popconfirm, Dropdown, Menu } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    FolderOpenOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { workflowServices } from '../api/apiEndpoints';

const { Title, Text, Paragraph } = Typography;

const MyWorkflows = () => {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isDarkMode = theme === 'dark';

    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const result = await workflowServices.getWorkflows(token);

            console.log('Workflows API Response:', result);

            // apiRequest wraps response in { success, data: responseData }
            // Backend returns { success, data: { workflows } }
            // So we need result.data.data.workflows
            if (result.success && result.data) {
                console.log('Workflows data:', result.data);
                const workflows = result.data.data?.workflows || result.data.workflows || [];
                console.log('Workflows array:', workflows);
                setWorkflows(workflows);
            } else {
                console.error('Failed to load workflows:', result.error);
                message.error(result.error || 'Failed to load workflows');
            }
        } catch (error) {
            console.error('Error in fetchWorkflows:', error);
            message.error('Failed to load workflows');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWorkflow = async (workflowId) => {
        try {
            const token = localStorage.getItem('token');
            const result = await workflowServices.deleteWorkflow(workflowId, token);

            if (result.success) {
                message.success('Workflow deleted successfully');
                fetchWorkflows(); // Refresh the list
            } else {
                message.error('Failed to delete workflow');
            }
        } catch (error) {
            console.error('Error deleting workflow:', error);
            message.error('Failed to delete workflow');
        }
    };

    const handleOpenWorkflow = (workflow) => {
        // Navigate to MainDev with the workflow data
        navigate('/maindev', { state: { workflow } });
    };

    const handleCreateNew = () => {
        navigate('/maindev');
    };

    const getActionsMenu = (workflow) => (
        <Menu>
            <Menu.Item
                key="open"
                icon={<FolderOpenOutlined />}
                onClick={() => handleOpenWorkflow(workflow)}
            >
                Open
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
            >
                <Popconfirm
                    title="Delete Workflow"
                    description="Are you sure you want to delete this workflow?"
                    onConfirm={() => handleDeleteWorkflow(workflow.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    Delete
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );

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
                    <Card
                        style={{
                            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                            borderColor: isDarkMode ? '#303030' : '#d9d9d9',
                            textAlign: 'center',
                            padding: '60px 20px'
                        }}
                    >
                        <Empty
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
                    </Card>
                ) : (
                    <Row gutter={[24, 24]}>
                        {workflows.map((workflow) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={workflow.id}>
                                <Card
                                    hoverable
                                    onClick={() => handleOpenWorkflow(workflow)}
                                    style={{
                                        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                                        borderColor: isDarkMode ? '#303030' : '#d9d9d9',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}
                                    bodyStyle={{ padding: '20px' }}
                                >
                                    {/* Workflow Thumbnail/Icon */}
                                    <div style={{
                                        width: '100%',
                                        height: '140px',
                                        backgroundColor: isDarkMode ? '#0f0f0f' : '#f5f5f5',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: isDarkMode ? '1px solid #303030' : '1px solid #e8e8e8'
                                    }}>
                                        {workflow.thumbnail ? (
                                            <img
                                                src={workflow.thumbnail}
                                                alt={workflow.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        ) : (
                                            <FolderOpenOutlined style={{
                                                fontSize: '48px',
                                                color: isDarkMode ? '#4a4a4a' : '#d9d9d9'
                                            }} />
                                        )}
                                    </div>

                                    {/* Workflow Info */}
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px'
                                        }}>
                                            <Title
                                                level={5}
                                                style={{
                                                    margin: 0,
                                                    color: isDarkMode ? '#ffffff' : '#000000',
                                                    flex: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {workflow.name}
                                            </Title>
                                            <Dropdown
                                                overlay={getActionsMenu(workflow)}
                                                trigger={['click']}
                                                placement="bottomRight"
                                            >
                                                <Button
                                                    type="text"
                                                    icon={<EllipsisOutlined />}
                                                    size="small"
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{
                                                        color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'
                                                    }}
                                                />
                                            </Dropdown>
                                        </div>

                                        <Paragraph
                                            type="secondary"
                                            ellipsis={{ rows: 2 }}
                                            style={{
                                                marginBottom: '12px',
                                                minHeight: '40px',
                                                fontSize: '13px'
                                            }}
                                        >
                                            {workflow.description || 'No description provided'}
                                        </Paragraph>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '12px',
                                            color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
                                        }}>
                                            <ClockCircleOutlined style={{ marginRight: '6px' }} />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {formatDate(workflow.updatedAt)}
                                            </Text>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default MyWorkflows;
