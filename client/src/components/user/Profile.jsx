import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { Typography, Card, Avatar, Form, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { theme, getColor } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const isDarkMode = theme === 'dark';
  
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
      });
    }
  }, [user, form]);
  
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Call your update user API or function here
      await updateUser(values);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '300px',
        color: isDarkMode ? 'white' : 'inherit'
      }}>
        Loading user profile...
      </div>
    );
  }
  
  return (
    <div style={{ background: getColor('level01'), padding: '20px', borderRadius: '4px' }}>
      <Title level={2} style={{ color: isDarkMode ? 'white' : 'inherit' }}>
        User Profile
      </Title>
      
      <Card 
        style={{ 
          maxWidth: 600, 
          margin: '0 auto',
          background: getColor('level02'),
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: 24,
          padding: '20px',
          background: getColor('level03'),
          borderRadius: '4px'
        }}>
          <Avatar 
            size={100} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: isDarkMode ? '#177ddc' : '#1890ff',
              marginBottom: 16 
            }}
          />
          <Title level={3} style={{ color: isDarkMode ? 'white' : 'inherit', margin: '8px 0' }}>
            {user.username}
          </Title>
          <Text type="secondary" style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'inherit' }}>
            {user.role}
          </Text>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            label={<span style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'inherit' }}>Username</span>}
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={<span style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'inherit' }}>Email</span>}
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="password"
            label={<span style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'inherit' }}>New Password (leave blank to keep current)</span>}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;