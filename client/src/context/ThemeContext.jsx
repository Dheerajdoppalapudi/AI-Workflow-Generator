import React, { createContext, useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const COLORS = {
    light: {
      level00: '#F2F2F2', 
      level01: '#FFFFFF', 
      level02: '#FFFFFF', 
      level03: '#FFFFFF', 
      text: 'rgba(0, 0, 0, 0.85)',
      headerBg: '#092e5d'
    },
    dark: {
      level00: '#1A1A1A', 
      level01: '#333333', 
      level02: '#333333', 
      level03: '#333333', 
      text: 'rgba(255, 255, 255, 0.85)',
      headerBg: '#001529'
    }
  };

  const getColor = (level) => {
    return COLORS[theme][level];
  };

  const lightTheme = {
    token: {
      colorPrimary: '#1890ff',
      colorBgContainer: COLORS.light.level01,
      colorTextBase: COLORS.light.text,
      borderRadius: 4,
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      lineWidth: 1,
      colorBgElevated: COLORS.light.level02,
      colorBorder: '#f0f0f0',
    },
    components: {
      Layout: {
        bodyBg: COLORS.light.level00,
        siderBg: COLORS.light.level01,
        headerBg: COLORS.light.headerBg
      },
      Menu: {
        itemSelectedBg: 'rgba(24, 144, 255, 0.1)',
        itemHoverBg: 'rgba(0, 0, 0, 0.03)',
      },
      Button: {
        borderRadiusBase: 4,
      }
    }
  };

  const darkTheme = {
    algorithm: antdTheme.darkAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      colorBgContainer: COLORS.dark.level01,
      colorBgElevated: COLORS.dark.level02,
      colorTextBase: COLORS.dark.text,
      borderRadius: 4,
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: 14,
      lineWidth: 1,
      colorBorder: '#303030',
    },
    components: {
      Layout: {
        bodyBg: COLORS.dark.level00,
        siderBg: COLORS.dark.level01,
        headerBg: COLORS.dark.headerBg
      },
      Menu: {
        itemSelectedBg: 'rgba(24, 144, 255, 0.2)',
        itemHoverBg: 'rgba(255, 255, 255, 0.04)',
      },
      Button: {
        borderRadiusBase: 4,
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, getColor }}>
      <ConfigProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};