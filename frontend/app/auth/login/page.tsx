'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state: authState, login, clearError } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      // Error is handled by AuthProvider
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      router.push('/');
    }
  }, [authState.isAuthenticated, authState.user, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.gray[50],
      padding: '2rem 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.lg,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: theme.colors.primary[600],
            borderRadius: theme.borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
              FS
            </span>
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: theme.colors.gray[900],
            marginBottom: '0.5rem',
          }}>
            Welcome back
          </h1>
          <p style={{ color: theme.colors.gray[600] }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {authState.error && (
          <div style={{
            backgroundColor: theme.colors.red[50],
            border: `1px solid ${theme.colors.red[200]}`,
            color: theme.colors.red[700],
            padding: '0.75rem 1rem',
            borderRadius: theme.borderRadius.md,
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}>
            {authState.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: theme.colors.gray[700],
              marginBottom: '0.5rem',
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${theme.colors.gray[300]}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? theme.colors.gray[50] : 'white',
                color: isLoading ? theme.colors.gray[500] : theme.colors.gray[900],
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary[500];
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.gray[300];
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '0.5rem' 
            }}>
              <label htmlFor="password" style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.gray[700],
              }}>
                Password
              </label>
              <Link 
                href="/auth/reset-password" 
                style={{
                  fontSize: '0.875rem',
                  color: theme.colors.primary[600],
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.colors.primary[600];
                }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${theme.colors.gray[300]}`,
                borderRadius: theme.borderRadius.md,
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: isLoading ? theme.colors.gray[50] : 'white',
                color: isLoading ? theme.colors.gray[500] : theme.colors.gray[900],
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary[500];
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.gray[300];
              }}
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            style={{ width: '100%', marginBottom: '1.5rem' }}
            disabled={isLoading || authState.isLoading}
          >
            {isLoading || authState.isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: `2px solid transparent`,
                  borderTop: `2px solid currentColor`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem',
                }} />
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </Button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: theme.colors.gray[600], fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                style={{
                  color: theme.colors.primary[600],
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.colors.primary[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.colors.primary[600];
                }}
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>

        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}