// AuthProvider.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { apiClient } from '@/lib/api';
import { User, AuthResponse } from '@/types/user';
import { useCallback } from 'react';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (uid: string, token: string, newPassword: string, confirmPassword: string) => Promise<void>;
  clearError: () => void;
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, isAuthenticated: true, user: action.payload, error: null };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, isAuthenticated: false, user: null, error: action.payload };
    case 'AUTH_LOGOUT':
      return { isLoading: false, isAuthenticated: false, user: null, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const [accessToken, setAccessToken] = useLocalStorage('access_token', '');
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh_token', '');

  useEffect(() => {
    const initializeAuth = async () => {
      if (!accessToken) {
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }
      dispatch({ type: 'AUTH_START' });
      try {
        const user = await apiClient.getProfile();
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        setAccessToken('');
        setRefreshToken('');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await apiClient.login(email, password);
      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await apiClient.register(userData);
      setAccessToken(response.access);
      setRefreshToken(response.refresh);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) await apiClient.logout(refreshToken);
    } finally {
      setAccessToken('');
      setRefreshToken('');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // --- NEW: Request password reset (sends email) ---
  const requestPasswordReset = async (email: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await apiClient.requestPasswordReset(email); // new API call
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Request failed' });
      throw error;
    }
  };

  // --- Reset password using token ---
  const resetPassword = async (uid: string, token: string, newPassword: string, confirmPassword: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await apiClient.resetPassword(uid, token, newPassword, confirmPassword);
      dispatch({ type: 'CLEAR_ERROR' });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Reset failed' });
      throw error;
    }
};

  const clearError = useCallback(() => {
  dispatch({ type: 'CLEAR_ERROR' });
}, [dispatch]);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, requestPasswordReset, resetPassword, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
