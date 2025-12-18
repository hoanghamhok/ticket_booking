import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/services/authService';
import { AuthContextType, User } from '../types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const { data } = await authService.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('token', data.accessToken);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await authService.register(email, password);
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('token', data.accessToken);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};




