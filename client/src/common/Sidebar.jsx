import React, { useContext } from 'react';
import { Layout, Menu, Button, Divider, Typography, Tooltip } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  DeploymentUnitOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const location = useLocation();

  const isDarkMode = theme === 'dark';
  const sidebarWidth = collapsed ? 80 : 220;

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
      {/* Header with Logo and Toggle Button */}
      <div style={{
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.06)',
        minHeight: '52px'
      }}>
        {/* Logo/Brand Section - Shows when expanded */}
        {!collapsed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <Text strong style={{
                fontSize: '13px',
                lineHeight: '1.2',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                BYOW
              </Text>
              <Text type="secondary" style={{
                fontSize: '10px',
                lineHeight: '1.2',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Workflow
              </Text>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
            flexShrink: 0,
            marginLeft: collapsed ? 'auto' : '8px',
            marginRight: collapsed ? 'auto' : 0
          }}
        />
      </div>

      {/* Menu Items */}
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

      {/* Footer with Version Info */}
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

export default Sidebar;