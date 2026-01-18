import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { Typography } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DevelopmentAgent = ({ isActive, isRunning, onComplete, onNext, onPrevious }) => {
    const { theme } = useContext(ThemeContext);
    const isDarkMode = theme === 'dark';

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <Title 
                    level={3} 
                    style={{ 
                        color: isDarkMode ? '#fff' : '#000',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <CodeOutlined style={{ 
                        color: isDarkMode ? '#3b7bd5' : '#2563eb',
                        fontSize: '24px',
                    }} />
                    Development Agent
                </Title>
                <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '16px' }}>
                    Writing clean, efficient code with automated documentation and best practices
                </Text>
            </div>
        </div>
    );
};

export default DevelopmentAgent;