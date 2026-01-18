import { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Space, Divider, Avatar, Spin } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    CloseOutlined,
    MessageOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const AIChatSidebar = ({ isOpen, onClose, isDarkMode, onGenerateWorkflow }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentPrompt = inputValue;
        setInputValue('');
        setIsLoading(true);

        try {
            // Call the workflow generation function
            const response = await onGenerateWorkflow(currentPrompt);

            if (response && response.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: `Great! I've generated a workflow based on your requirements. The workflow has been applied to the canvas with ${response.workflowJson?.agents?.length || 0} agents. You can now customize it further or save it.`,
                    timestamp: new Date(),
                    workflowJson: response.workflowJson
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: `I encountered an error while generating the workflow: ${response?.error || 'Unknown error'}. Please try again or rephrase your request.`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Error generating workflow:', error);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `Sorry, I encountered an error: ${error.message}. Please make sure Ollama is running and try again.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100vh',
                width: isOpen ? '400px' : '0',
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                borderLeft: isOpen ? `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` : 'none',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? '#111827' : '#f9fafb'
                }}>
                    <Space>
                        <RobotOutlined style={{
                            fontSize: 20,
                            color: '#3b82f6'
                        }} />
                        <Text strong style={{
                            fontSize: 16,
                            color: isDarkMode ? '#f3f4f6' : '#1f2937'
                        }}>
                            AI Workflow Assistant
                        </Text>
                    </Space>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        style={{
                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }}
                    />
                </div>

                {/* Messages Container */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    backgroundColor: isDarkMode ? '#111827' : '#f9fafb'
                }}>
                    {messages.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }}>
                            <RobotOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                            <Text style={{
                                display: 'block',
                                color: isDarkMode ? '#d1d5db' : '#6b7280'
                            }}>
                                Hi! I'm your AI workflow assistant.
                            </Text>
                            <Text style={{
                                display: 'block',
                                fontSize: 13,
                                marginTop: 8,
                                color: isDarkMode ? '#9ca3af' : '#9ca3af'
                            }}>
                                Describe the workflow you want to create, and I'll help you build it!
                            </Text>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                style={{
                                    marginBottom: 20,
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'flex-start'
                                }}
                            >
                                {/* Avatar */}
                                <Avatar
                                    icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                    style={{
                                        backgroundColor: message.type === 'user'
                                            ? '#10b981'
                                            : '#3b82f6',
                                        flexShrink: 0
                                    }}
                                />

                                {/* Message Content */}
                                <div style={{ flex: 1 }}>
                                    <Text strong style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontSize: 13,
                                        color: isDarkMode ? '#f3f4f6' : '#1f2937'
                                    }}>
                                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                                    </Text>
                                    <div style={{
                                        backgroundColor: message.type === 'user'
                                            ? (isDarkMode ? '#1e3a4c' : '#eff6ff')
                                            : (isDarkMode ? '#2d1e3a' : '#f3e8ff'),
                                        padding: '12px 14px',
                                        borderRadius: 8,
                                        color: isDarkMode ? '#e5e7eb' : '#374151',
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {message.content}
                                    </div>
                                    <Text type="secondary" style={{
                                        fontSize: 11,
                                        marginTop: 4,
                                        display: 'block'
                                    }}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            marginBottom: 20
                        }}>
                            <Avatar
                                icon={<RobotOutlined />}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{
                                backgroundColor: isDarkMode ? '#2d1e3a' : '#f3e8ff',
                                padding: '12px 14px',
                                borderRadius: 8
                            }}>
                                <Space>
                                    <Spin size="small" />
                                    <Text style={{
                                        color: isDarkMode ? '#e5e7eb' : '#374151',
                                        fontSize: 14
                                    }}>
                                        Thinking...
                                    </Text>
                                </Space>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff'
                }}>
                    <Space.Compact style={{ width: '100%' }}>
                        <TextArea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your workflow..."
                            autoSize={{ minRows: 1, maxRows: 4 }}
                            disabled={isLoading}
                            style={{
                                resize: 'none',
                                backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
                                color: isDarkMode ? '#e5e7eb' : '#374151',
                                borderColor: isDarkMode ? '#374151' : '#d1d5db'
                            }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            style={{
                                height: 'auto',
                                backgroundColor: '#3b82f6',
                                borderColor: '#3b82f6'
                            }}
                        />
                    </Space.Compact>
                    <Text type="secondary" style={{
                        fontSize: 11,
                        display: 'block',
                        marginTop: 8
                    }}>
                        Press Enter to send, Shift+Enter for new line
                    </Text>
                </div>
            </div>

            {/* Toggle Button (when closed) */}
            {!isOpen && (
                <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={() => {}}
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        backgroundColor: '#3b82f6',
                        borderColor: '#3b82f6',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                        zIndex: 999
                    }}
                />
            )}
        </>
    );
};

export default AIChatSidebar;
