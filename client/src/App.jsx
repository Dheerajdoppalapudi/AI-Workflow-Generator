import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Spin, Menu, Avatar, Dropdown, Typography, Button, Divider, Tooltip } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  FileOutlined,
  TeamOutlined,
  BulbOutlined,
  BulbFilled,
  LogoutOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/user/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import HomePage from './pages/HomePage';
import MainDev from './pages/MainDev';
import MyWorkflows from './pages/MyWorkflows';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

// Navbar component
const NavbarComponent = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, getColor } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const isDarkMode = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ 
      background: isDarkMode ? '#001529' : '#092e5d', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'fixed',
      width: '100%',
      zIndex: 2
    }}>
      {/* Company Logo/Name */}
      <div>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <span style={{ fontWeight: 600 }}>BYOW</span>
            <span style={{ fontWeight: 300, margin: '0 8px' }}>|</span>
            <span style={{ fontWeight: 300, fontSize: '16px' }}>Build Your Own Workflow</span>
          </Link>
        </Title>
      </div>

      {/* Theme Toggle and User Info */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Theme Toggle Switch */}
        <Button 
          type="text" 
          icon={isDarkMode ? <BulbFilled style={{ color: '#f8e71c' }} /> : <BulbOutlined style={{ color: '#f8e71c' }} />}
          onClick={toggleTheme}
          style={{ color: 'white', marginRight: '16px' }}
        />
        
        {user ? (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '4px',
              transition: 'background 0.3s',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}>
              <Avatar 
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: isDarkMode ? '#177ddc' : '#1890ff',
                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2)'
                }} 
              />
              <span style={{ 
                color: 'white', 
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: 500
              }}>
                {user.username}
              </span>
            </div>
          </Dropdown>
        ) : (
          <div>
            <Button 
              type="link" 
              style={{ color: 'white' }} 
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              type="primary" 
              ghost 
              onClick={() => navigate('/register')}
              style={{
                borderColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
              }}
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

// Sidebar component
const SidebarComponent = ({ collapsed, setCollapsed }) => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const isDarkMode = theme === 'dark';
  const sidebarWidth = collapsed ? 80 : 220;

  // Updated sidebar styling for a more modern and minimalistic look
  const sidebarStyle = {
    background: isDarkMode ? '#161B22' : 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 64,
    borderRight: isDarkMode ? '1px solid #30363D' : '1px solid rgba(0, 0, 0, 0.06)',
    zIndex: 1,
    transition: 'all 0.3s ease'
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
      title: 'Home'
    }
  ];

  if (user) {
    menuItems.push(
      {
        key: '/maindev',
        icon: <DeploymentUnitOutlined />,
        label: <Link to="/maindev">Main Dev</Link>,
        title: 'Main Dev'
      },
      {
        key: '/workflows',
        icon: <FolderOutlined />,
        label: <Link to="/workflows">My Workflows</Link>,
        title: 'My Workflows'
      },
      {
        key: '/profile',
        icon: <UserOutlined />,
        label: <Link to="/profile">Profile</Link>,
        title: 'Profile'
      }
    );
  }

  if (user && user.role === 'admin') {
    menuItems.push({
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Admin Panel</Link>,
      title: 'Admin Panel'
    });
  }

  return (
    <Sider
      width={sidebarWidth}
      collapsedWidth={80}
      collapsed={collapsed}
      style={sidebarStyle}
      theme={isDarkMode ? "dark" : "light"}
      trigger={null}
    >
      {/* Collapse Toggle Button */}
      <div style={{
        padding: '12px',
        textAlign: collapsed ? 'center' : 'right',
        borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        inlineCollapsed={collapsed}
        style={{
          borderRight: 0,
          height: 'calc(100% - 140px)',
          background: 'transparent',
          padding: '12px 0'
        }}
        theme={isDarkMode ? "dark" : "light"}
        items={menuItems.map(item => ({
          key: item.key,
          icon: collapsed ? (
            <Tooltip title={item.title} placement="right">
              {item.icon}
            </Tooltip>
          ) : item.icon,
          label: item.label
        }))}
      />

      <div style={{
        position: 'absolute',
        bottom: '16px',
        width: '100%',
        padding: collapsed ? '0 8px' : '0 16px',
        boxSizing: 'border-box',
        background: 'transparent'
      }}>
        <Divider style={{
          margin: '8px 0',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'
        }} />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{
            fontSize: '12px',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'
          }}>
            {collapsed ? 'v1.0' : 'BYOW v1.0.0'}
          </Text>
        </div>
      </div>
    </Sider>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: isDarkMode ? '#1f1f1f' : '#ffffff'
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: isDarkMode ? '#1f1f1f' : '#ffffff'
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

// App content with router
const AppContent = () => {
  const { user } = useContext(AuthContext);
  const { theme, getColor } = useContext(ThemeContext);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 80 : 220;

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <NavbarComponent />

        {user && <SidebarComponent collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />}

        <Layout style={{
          marginLeft: user ? sidebarWidth : 0,
          marginTop: 64,
          transition: 'all 0.3s ease',
          background: getColor('level00')
        }}>
          <Content style={{
            // padding: 24,
            background: getColor('level01'),
            minHeight: 'calc(100vh - 64px - 36px)'
          }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/maindev" element={
                <ProtectedRoute>
                  <MainDev />
                </ProtectedRoute>
              } />
              <Route path="/workflows" element={
                <ProtectedRoute>
                  <MyWorkflows />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
          <Footer style={{
            textAlign: 'center',
            background: 'transparent',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
            padding: '12px 20px',
            fontSize: '12px',
            lineHeight: '1.2'
          }}>
            BYOW ©{new Date().getFullYear()} - Build Your Own Workflow
          </Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

// Main App with AuthProvider and ThemeProvider
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;