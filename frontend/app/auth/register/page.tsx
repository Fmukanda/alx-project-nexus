'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { state: authState, register, clearError } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
    setPasswordError('');
  }, [clearError]);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      };
      
      await register(userData);
    } catch (error) {
      console.error('Registration failed:', error);
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
        maxWidth: '450px',
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
            Create your account
          </h1>
          <p style={{ color: theme.colors.gray[600] }}>
            Join FashionStore today
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

        {passwordError && (
          <div style={{
            backgroundColor: theme.colors.red[50],
            border: `1px solid ${theme.colors.red[200]}`,
            color: theme.colors.red[700],
            padding: '0.75rem 1rem',
            borderRadius: theme.borderRadius.md,
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}>
            {passwordError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="firstName" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.gray[700],
                marginBottom: '0.5rem',
              }}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                placeholder="First name"
              />
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="lastName" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme.colors.gray[700],
                marginBottom: '0.5rem',
              }}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: theme.colors.gray[700],
              marginBottom: '0.5rem',
            }}>
              Password
            </label>
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
              placeholder="Create a password"
            />
            <div style={{
              fontSize: '0.75rem',
              color: theme.colors.gray[500],
              marginTop: '0.5rem',
            }}>
              Password must be at least 8 characters long
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: theme.colors.gray[700],
              marginBottom: '0.5rem',
            }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: passwordError ? `1px solid ${theme.colors.red[300]}` : `1px solid ${theme.colors.gray[300]}`,
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
                e.target.style.borderColor = passwordError ? theme.colors.red[300] : theme.colors.gray[300];
              }}
              placeholder="Confirm your password"
            />
          </div>

          {/* Terms and Conditions */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            marginBottom: '1.5rem' 
          }}>
            <input
              id="terms"
              type="checkbox"
              required
              disabled={isLoading}
              style={{
                marginRight: '0.5rem',
                marginTop: '0.25rem',
              }}
            />
            <label htmlFor="terms" style={{
              fontSize: '0.875rem',
              color: theme.colors.gray[600],
            }}>
              I agree to the{' '}
              <Link 
                href="/terms" 
                style={{
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
                Terms and Conditions
              </Link>
              {' '}and{' '}
              <Link 
                href="/privacy" 
                style={{
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
                Privacy Policy
              </Link>
            </label>
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
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </Button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: theme.colors.gray[600], fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
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
                Sign in
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