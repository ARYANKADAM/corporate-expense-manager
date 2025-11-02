'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me');
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const loginData = { email, password };
      if (role) {
        loginData.role = role;
      }
      
      const response = await axios.post('/api/auth/login', loginData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set user state
        setUser(user);
        
        // Redirect based on role
        redirectByRole(user.role);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (data) => {
    try {
      const response = await axios.post('/api/auth/register', data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set user state
        setUser(user);
        
        // Redirect based on role
        redirectByRole(user.role);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Redirect to login
    router.push('/login');
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'employee':
        router.push('/employee');
        break;
      case 'manager':
        router.push('/manager');
        break;
      case 'finance':
      case 'admin':
        router.push('/finance');
        break;
      case 'executive':
        router.push('/executive');
        break;
      default:
        router.push('/employee');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;