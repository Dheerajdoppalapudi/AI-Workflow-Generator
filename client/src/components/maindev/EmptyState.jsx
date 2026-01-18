import React from 'react';
import { Typography, Spin } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const EmptyState = ({ type, isDarkMode, teamName }) => {
    const getContent = () => {
        switch (type) {
            case 'loading':
                return {
                    icon: <Spin size="large" />,
                    title: `Loading ${teamName} agents...`,
                    description: null
                };
            default:
                return {
                    icon: <TeamOutlined style={{
                        fontSize: 48,
                        color: isDarkMode ? '#374151' : '#9ca3af',
                        marginBottom: 16
                    }} />,
                    title: 'Select a Development Team',
                    description: 'Choose from our specialized teams to start your AI-powered development pipeline'
                };
        }
    };

    const content = getContent();

    return (
        <div style={{
            backgroundColor: isDarkMode ? '#111' : '#fff',
            border: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
            borderRadius: 8,
            padding: '60px 24px',
            textAlign: 'center'
        }}>
            {content.icon}
            {type === 'loading' && (
                <div style={{ marginTop: 16 }}>
                    <Text style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 16
                    }}>
                        {content.title}
                    </Text>
                </div>
            )}
            {type !== 'loading' && (
                <>
                    <Title level={3} style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        marginBottom: 8
                    }}>
                        {content.title}
                    </Title>
                    <Text style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 16
                    }}>
                        {content.description}
                    </Text>
                </>
            )}
        </div>
    );
};

export default EmptyState;