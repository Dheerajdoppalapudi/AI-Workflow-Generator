import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Error loading user from localStorage:", err);
      setError("Failed to load user session");
      // Clear potentially corrupted data
      localStorage.removeItem("user");
    } finally {
      setLoading(false); // Mark loading as complete
    }
  }, []);

  const login = (token, id, username, role) => {
    try {
      const userData = { token, id, username, role };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error during login:", err);
      setError("Login failed");
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      setError(null);
      return true;
    } catch (err) {
      console.error("Error during logout:", err);
      setError("Logout failed");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};