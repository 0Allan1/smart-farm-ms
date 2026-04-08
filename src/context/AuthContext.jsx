import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('sfms_token');
      if (token) {
        try {
          // Verify token and fetch user profile
          const userData = await api.get('/users/me');
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to authenticate:', error);
          localStorage.removeItem('sfms_token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (phone, password) => {
    try {
      const data = await api.post('/auth/login', { phone, password });
      localStorage.setItem('sfms_token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Invalid phone number or password' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.post('/auth/register', userData);
      // Registration successful, return to let the user login (or automatically login)
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create account. Please try again' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('sfms_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
