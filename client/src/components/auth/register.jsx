import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography, Divider } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { authServices } from "../../api/apiEndpoints";

const { Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Check if passwords match
      if (values.password !== values.confirmPassword) {
        message.error("Passwords do not match!");
        setLoading(false);
        return;
      }

      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...userData } = values;
      
      const response = await authServices.register(userData);
      
      if (response.success) {
        message.success("Registration successful! Please log in.");
        navigate("/login");
      } else {
        message.error(response.error || "Registration failed");
      }
    } catch (error) {
      message.error("Something went wrong!");
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "calc(100vh - 128px)", 
      padding: "20px"
    }}>
      <Card 
        title="Create a DesignGen Account" 
        bordered={true}
        style={{ 
          width: 400,
          border: "1px solid #e8e8e8",
          borderRadius: "4px"
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item 
            label="Username" 
            name="username" 
            rules={[
              { required: true, message: "Please enter a username" },
              { min: 3, message: "Username must be at least 3 characters" }
            ]}
          >
            <Input placeholder="Choose a username" />
          </Form.Item>
          
          <Form.Item 
            label="Email" 
            name="email" 
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          
          <Form.Item 
            label="Password" 
            name="password" 
            rules={[
              { required: true, message: "Please enter a password" },
              { min: 6, message: "Password must be at least 6 characters" }
            ]}
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>
          
          <Form.Item 
            label="Confirm Password" 
            name="confirmPassword" 
            rules={[
              { required: true, message: "Please confirm your password" },
              { min: 6, message: "Password must be at least 6 characters" }
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
        </Form>
        
        <Divider plain>
          <Text type="secondary">Already have an account?</Text>
        </Divider>
        
        <div style={{ textAlign: "center" }}>
          <Link to="/login">
            <Button type="default" block>
              Login Instead
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;