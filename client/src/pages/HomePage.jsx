import React, { useContext } from "react";
import { Typography, Card, Row, Col, Button } from "antd";
import { FileTextOutlined, TeamOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const { theme, getColor } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  const features = [
    {
      title: "Custom Workflows",
      icon: <SettingOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Design and build workflows tailored to your unique business needs with intuitive drag-and-drop tools.",
    },
    {
      title: "AI-Powered Agents",
      icon: <TeamOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Deploy intelligent agents that automate tasks and collaborate seamlessly within your workflows.",
    },
    {
      title: "Visual Planning",
      icon: <FileTextOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Map out requirements and architecture with visual tools that transform ideas into actionable plans.",
    },
    {
      title: "Team Management",
      icon: <UserOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Organize your team of agents and human collaborators for maximum efficiency and productivity.",
    },
  ];

  return (
    <div style={{ padding: "40px 20px", background: getColor('level01') }}>
      {/* Hero section */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          background: isDarkMode ? "#001529" : "#092e5d",
          color: "white",
          borderRadius: "12px",
          marginBottom: "50px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={1} style={{ color: "white", marginBottom: "20px", fontSize: "48px" }}>
          Build Your Own Workflow
        </Title>
        <Paragraph style={{ fontSize: "20px", maxWidth: "900px", margin: "0 auto 32px", color: "rgba(255, 255, 255, 0.95)", lineHeight: "1.6" }}>
          Empower your team with intelligent, customizable workflows. Design, automate, and optimize your processes with AI-powered agents and intuitive visual tools.
        </Paragraph>
        
        {!user ? (
          <div>
            <Link to="/login">
              <Button type="primary" size="large" style={{ marginRight: "16px" }}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large" ghost>
                Register
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <Link to="/maindev">
              <Button type="primary" size="large" style={{ marginRight: "16px", height: "48px", fontSize: "16px", padding: "0 32px" }}>
                Start Building
              </Button>
            </Link>
            <Link to="/profile">
              <Button size="large" ghost style={{ height: "48px", fontSize: "16px", padding: "0 32px" }}>
                View Profile
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features section */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <Title level={2} style={{
          textAlign: "center",
          marginBottom: "50px",
          color: isDarkMode ? "white" : "#1a1a1a",
          fontSize: "36px"
        }}>
          What You Can Build
        </Title>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                style={{
                  height: "100%",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  background: getColor('level02'),
                  borderRadius: "12px",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease"
                }}
                hoverable
              >
                <div style={{ marginBottom: "20px" }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ color: isDarkMode ? "white" : "inherit" }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "inherit" }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          maxWidth: "900px",
          margin: "80px auto 0",
          textAlign: "center",
          background: isDarkMode ? "rgba(24, 144, 255, 0.1)" : "rgba(9, 46, 93, 0.05)",
          padding: "60px 40px",
          borderRadius: "16px",
          border: isDarkMode ? "2px solid rgba(24, 144, 255, 0.2)" : "2px solid rgba(9, 46, 93, 0.1)"
        }}
      >
        <Title level={2} style={{ color: isDarkMode ? "white" : "#1a1a1a", marginBottom: "20px" }}>
          Ready to Transform Your Workflow?
        </Title>
        <Paragraph style={{
          marginBottom: "32px",
          fontSize: "18px",
          color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.75)"
        }}>
          Start building intelligent workflows that adapt to your needs. No coding required.
        </Paragraph>

        {!user ? (
          <Link to="/register">
            <Button type="primary" size="large" style={{
              background: isDarkMode ? "#1890ff" : "#092e5d",
              height: "52px",
              fontSize: "18px",
              padding: "0 40px",
              borderRadius: "8px"
            }}>
              Get Started Free
            </Button>
          </Link>
        ) : (
          <Link to="/maindev">
            <Button type="primary" size="large" style={{
              background: isDarkMode ? "#1890ff" : "#092e5d",
              height: "52px",
              fontSize: "18px",
              padding: "0 40px",
              borderRadius: "8px"
            }}>
              Create Your Workflow
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;