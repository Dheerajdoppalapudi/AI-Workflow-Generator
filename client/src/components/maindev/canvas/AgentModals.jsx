import React from 'react';
import { Modal, Form, Input, Button, Typography, Space, Divider, Checkbox, Tag } from 'antd';
import { RobotOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined, SettingOutlined, LockOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

// Agent Form Modal - for adding/editing agents
export const AgentFormModal = ({
    isOpen,
    onClose,
    onSave,
    form,
    editingNode,
    isLoading,
    isDarkMode
}) => {
    // Use 3-column layout only when editing an existing node
    const useThreeColumnLayout = !!editingNode;

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RobotOutlined style={{ color: '#3b82f6' }} />
                    {editingNode ? 'Edit Agent' : 'Add New Agent'}
                </div>
            }
            open={isOpen}
            onOk={onSave}
            onCancel={onClose}
            okText={editingNode ? 'Update' : 'Add'}
            width={useThreeColumnLayout ? 1200 : 650}
            confirmLoading={isLoading}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
                onFinish={onSave}
            >
                {useThreeColumnLayout ? (
                    // Three Column Layout for Edit Mode
                    <div style={{ display: 'flex', gap: 16 }}>
                        {/* Column 1: Input Section */}
                        <div style={{
                            flex: 1,
                            padding: 16,
                            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                            borderRadius: 8,
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12
                            }}>
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    backgroundColor: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <LoginOutlined style={{ color: '#fff', fontSize: 14 }} />
                                </div>
                                <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 14 }}>
                                    Input
                                </Text>
                            </div>
                            <Form.Item
                                name="input"
                                style={{ marginBottom: 0, flex: 1 }}
                            >
                                <TextArea
                                    rows={18}
                                    placeholder="Enter input for this agent..."
                                    style={{
                                        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: 6,
                                        resize: 'none',
                                        height: '100%'
                                    }}
                                />
                            </Form.Item>
                        </div>

                        {/* Column 2: Agent Configuration */}
                        <div style={{
                            flex: 1,
                            padding: 16,
                            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                            borderRadius: 8,
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12
                            }}>
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    backgroundColor: '#8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                                </div>
                                <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 14 }}>
                                    Agent Configuration
                                </Text>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <Form.Item
                                    name="name"
                                    label={<Text style={{ color: isDarkMode ? '#d1d5db' : '#374151', fontSize: 13 }}>Agent Name</Text>}
                                    rules={[{ required: true, message: 'Please enter agent name' }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <Input placeholder="e.g., Requirements Analyst" />
                                </Form.Item>

                                <Form.Item
                                    name="description"
                                    label={<Text style={{ color: isDarkMode ? '#d1d5db' : '#374151', fontSize: 13 }}>Description</Text>}
                                    rules={[{ required: true, message: 'Please enter description' }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <TextArea
                                        rows={2}
                                        placeholder="Describe what this agent does..."
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="prompt"
                                    label={<Text style={{ color: isDarkMode ? '#d1d5db' : '#374151', fontSize: 13 }}>Agent Prompt</Text>}
                                    rules={[{ required: true, message: 'Please enter agent prompt' }]}
                                    style={{ marginBottom: 12 }}
                                >
                                    <TextArea
                                        rows={6}
                                        placeholder="Enter the prompt that defines this agent's behavior..."
                                    />
                                </Form.Item>

                                <Divider style={{ margin: '8px 0' }}>
                                    <Space>
                                        <SettingOutlined style={{ color: '#3b82f6', fontSize: 12 }} />
                                        <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}>
                                            Settings
                                        </Text>
                                    </Space>
                                </Divider>

                                <Form.List name="settings">
                                    {(fields, { add, remove }) => (
                                        <div style={{ maxHeight: 100, overflowY: 'auto' }}>
                                            {fields.map(({ key, name, ...restField }) => {
                                                const settingValue = form.getFieldValue(['settings', name]);
                                                const isRequired = settingValue?.required === true;

                                                return (
                                                    <div
                                                        key={key}
                                                        style={{
                                                            display: 'flex',
                                                            gap: 6,
                                                            marginBottom: 8,
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'key']}
                                                            style={{ marginBottom: 0, flex: 1 }}
                                                        >
                                                            <Input
                                                                placeholder="Key"
                                                                size="small"
                                                                disabled={isRequired}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'value']}
                                                            style={{ marginBottom: 0, flex: 1 }}
                                                        >
                                                            <Input placeholder="Value" size="small" />
                                                        </Form.Item>
                                                        {!isRequired && (
                                                            <MinusCircleOutlined
                                                                onClick={() => remove(name)}
                                                                style={{ color: '#ef4444', cursor: 'pointer' }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                type="dashed"
                                                onClick={() => add({ key: '', value: '', required: false })}
                                                block
                                                size="small"
                                                icon={<PlusOutlined />}
                                                style={{
                                                    borderColor: '#3b82f6',
                                                    color: '#3b82f6'
                                                }}
                                            >
                                                Add Setting
                                            </Button>
                                        </div>
                                    )}
                                </Form.List>
                            </div>
                        </div>

                        {/* Column 3: Output Section */}
                        <div style={{
                            flex: 1,
                            padding: 16,
                            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                            borderRadius: 8,
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12
                            }}>
                                <div style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    backgroundColor: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <LogoutOutlined style={{ color: '#fff', fontSize: 14 }} />
                                </div>
                                <Text strong style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: 14 }}>
                                    Output
                                </Text>
                            </div>
                            <Form.Item
                                name="output"
                                style={{ marginBottom: 0, flex: 1 }}
                            >
                                <TextArea
                                    rows={18}
                                    placeholder="Agent output will appear here after execution..."
                                    readOnly
                                    style={{
                                        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                        borderRadius: 6,
                                        resize: 'none',
                                        height: '100%',
                                        color: isDarkMode ? '#d1d5db' : '#374151'
                                    }}
                                />
                            </Form.Item>
                        </div>
                    </div>
                ) : (
                    // Single Column Layout for Add Mode
                    <>
                        <Form.Item
                            name="name"
                            label="Agent Name"
                            rules={[{ required: true, message: 'Please enter agent name' }]}
                        >
                            <Input placeholder="e.g., Requirements Analyst" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter description' }]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Describe what this agent does..."
                            />
                        </Form.Item>

                        <Form.Item
                            name="prompt"
                            label="Agent Prompt"
                            rules={[{ required: true, message: 'Please enter agent prompt' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Enter the prompt that defines this agent's behavior..."
                            />
                        </Form.Item>

                        <Divider style={{ margin: '20px 0 16px 0' }}>
                            <Space>
                                <SettingOutlined style={{ color: '#3b82f6' }} />
                                <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 13 }}>
                                    Settings
                                </Text>
                            </Space>
                        </Divider>

                        <Form.List name="settings">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => {
                                        const settingValue = form.getFieldValue(['settings', name]);
                                        const isRequired = settingValue?.required === true;

                                        return (
                                            <div
                                                key={key}
                                                style={{
                                                    display: 'flex',
                                                    gap: 8,
                                                    marginBottom: 12,
                                                    alignItems: 'flex-start'
                                                }}
                                            >
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'key']}
                                                    rules={[{ required: true, message: 'Enter label' }]}
                                                    style={{ marginBottom: 0, flex: 1 }}
                                                >
                                                    <Input
                                                        placeholder="Label"
                                                        disabled={isRequired}
                                                        style={{
                                                            backgroundColor: isDarkMode ? '#374151' : '#f3f4f6'
                                                        }}
                                                        suffix={isRequired ? <LockOutlined style={{ color: '#9ca3af' }} /> : null}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    rules={[{
                                                        required: isRequired,
                                                        message: `${settingValue?.key || 'This field'} is required`
                                                    }]}
                                                    style={{ marginBottom: 0, flex: 2 }}
                                                >
                                                    <Input
                                                        placeholder={isRequired ? `Enter ${settingValue?.key || 'value'} (Required)` : 'Value'}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'required']}
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox
                                                        disabled={isRequired}
                                                        style={{ marginTop: 4 }}
                                                    >
                                                        <Text style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                                                            Required
                                                        </Text>
                                                    </Checkbox>
                                                </Form.Item>
                                                {!isRequired && (
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<MinusCircleOutlined />}
                                                        onClick={() => remove(name)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                    <Button
                                        type="dashed"
                                        onClick={() => add({ key: '', value: '', required: false })}
                                        block
                                        icon={<PlusOutlined />}
                                        style={{
                                            borderColor: '#3b82f6',
                                            color: '#3b82f6',
                                            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'
                                        }}
                                    >
                                        Add Setting
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </>
                )}
            </Form>
        </Modal>
    );
};

// Save Workflow Modal
export const SaveWorkflowModal = ({
    isOpen,
    onClose,
    onSave,
    form,
    isLoading,
    selectedTeam,
    isDarkMode
}) => {
    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SaveOutlined style={{ color: '#3b82f6' }} />
                    Save Workflow
                </div>
            }
            open={isOpen}
            onOk={() => form.submit()}
            onCancel={onClose}
            okText="Save"
            width={500}
            confirmLoading={isLoading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSave}
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    name="workflowName"
                    label="Workflow Name"
                    rules={[{ required: true, message: 'Please enter workflow name' }]}
                >
                    <Input placeholder="e.g., My Custom Agent Pipeline" />
                </Form.Item>

                <Form.Item
                    name="workflowDescription"
                    label="Description (Optional)"
                >
                    <TextArea
                        rows={3}
                        placeholder="Describe your workflow..."
                    />
                </Form.Item>

                {selectedTeam && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
                        borderRadius: '6px',
                        marginBottom: '16px'
                    }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            This workflow will be saved under team: <Text strong>{selectedTeam.name}</Text>
                        </Text>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

// Template Details Modal
export const TemplateDetailsModal = ({
    isOpen,
    onClose,
    template,
    onAddToCanvas,
    isDarkMode
}) => {
    // Parse settings if it's a string
    const getSettings = () => {
        if (!template?.settings) return null;
        try {
            if (typeof template.settings === 'string') {
                return JSON.parse(template.settings);
            }
            return template.settings;
        } catch {
            return null;
        }
    };

    const settings = getSettings();

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RobotOutlined style={{ color: '#3b82f6' }} />
                    Agent Details
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Close
                </Button>,
                <Button
                    key="add"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        if (template) {
                            onAddToCanvas(template);
                            onClose();
                        }
                    }}
                >
                    Add to Canvas
                </Button>
            ]}
            width={600}
        >
            {template && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ marginBottom: 20 }}>
                        <Text strong style={{
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: 14,
                            display: 'block',
                            marginBottom: 4
                        }}>
                            Name
                        </Text>
                        <Text style={{
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: 14
                        }}>
                            {template.name}
                        </Text>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <Text strong style={{
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: 14,
                            display: 'block',
                            marginBottom: 4
                        }}>
                            Description
                        </Text>
                        <Text style={{
                            color: isDarkMode ? '#d1d5db' : '#6b7280',
                            fontSize: 14
                        }}>
                            {template.description || 'No description provided'}
                        </Text>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <Text strong style={{
                            color: isDarkMode ? '#f3f4f6' : '#1f2937',
                            fontSize: 14,
                            display: 'block',
                            marginBottom: 4
                        }}>
                            Prompt
                        </Text>
                        <div style={{
                            padding: '12px',
                            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                            borderRadius: '6px',
                            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}>
                            <Text style={{
                                color: isDarkMode ? '#d1d5db' : '#6b7280',
                                fontSize: 13,
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace'
                            }}>
                                {template.prompt || 'No prompt provided'}
                            </Text>
                        </div>
                    </div>

                    {/* Settings Section */}
                    {settings && Array.isArray(settings) && settings.length > 0 && (
                        <div>
                            <Text strong style={{
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                fontSize: 14,
                                display: 'block',
                                marginBottom: 8
                            }}>
                                <SettingOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
                                Settings
                            </Text>
                            <div style={{
                                padding: '12px',
                                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                                borderRadius: '6px',
                                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                            }}>
                                {settings.map((setting, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '8px 0',
                                            borderBottom: index < settings.length - 1
                                                ? `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
                                                : 'none'
                                        }}
                                    >
                                        <Text style={{
                                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                                            fontSize: 13
                                        }}>
                                            {setting.key}
                                        </Text>
                                        <Text style={{
                                            color: isDarkMode ? '#d1d5db' : '#374151',
                                            fontSize: 13,
                                            fontFamily: 'monospace'
                                        }}>
                                            {setting.value}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default {
    AgentFormModal,
    SaveWorkflowModal,
    TemplateDetailsModal
};
