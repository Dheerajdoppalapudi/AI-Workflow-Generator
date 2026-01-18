import React, { useState, useContext } from "react";
import { Form, Input, Button, message, Card, Typography, Divider } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { authServices } from "../../api/apiEndpoints";

const { Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authServices.login(values);
  
      if (response.success) {
        const { token, user } = response.data;
        login(token, user.id, user.username, user.role);
        message.success(`Welcome, ${user.username}!`);
        navigate("/");
      } else {
        message.error(response.error || "Login failed");
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
        title="Login to DesignGen" 
        bordered={true}
        style={{ 
          width: 400,
          border: "1px solid #e8e8e8",
          borderRadius: "4px"
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: "Enter your username" }]}>
            <Input placeholder="Enter your username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password" }]}>
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
        
        <Divider plain>
          <Text type="secondary">Don't have an account?</Text>
        </Divider>
        
        <div style={{ textAlign: "center" }}>
          <Link to="/register">
            <Button type="default" block>
              Register Now
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;