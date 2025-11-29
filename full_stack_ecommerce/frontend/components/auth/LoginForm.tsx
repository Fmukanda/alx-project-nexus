'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      onSuccess?.();
      router.push(returnUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'customer' | 'admin') => {
    const demoCredentials = {
      customer: { email: 'demo@customer.com', password: 'demopassword' },
      admin: { email: 'admin@demo.com', password: 'adminpassword' }
    };

    setFormData(demoCredentials[role]);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '0.5rem',
        }}>
          Welcome Back
        </h1>
        <p style={{ color: '#6b7280' }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Demo Login Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280', 
          textAlign: 'center',
          marginBottom: '1rem',
        }}>
          Quick demo access:
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDemoLogin('customer')}
            style={{ flex: 1 }}
            disabled={isLoading}
          >
            Customer Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDemoLogin('admin')}
            style={{ flex: 1 }}
            disabled={isLoading}
          >
            Admin Demo
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        color: '#6b7280',
        fontSize: '0.875rem',
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        <span style={{ padding: '0 1rem' }}>or sign in with email</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          <AlertCircle size={20} color="#dc2626" />
          <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>
            {error}
          </span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail 
              size={20} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock 
              size={20} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}
            />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              style={{ width: '1rem', height: '1rem' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              Remember me
            </span>
          </label>

          <Link 
            href="/auth/reset-password"
            style={{
              fontSize: '0.875rem',
              color: '#0284c7',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{ width: '100%', marginBottom: '1.5rem' }}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          {onSwitchToRegister ? (
            <button
              onClick={onSwitchToRegister}
              style={{
                color: '#0284c7',
                fontWeight: '500',
                textDecoration: 'none',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              Sign up
            </button>
          ) : (
            <Link 
              href="/auth/register"
              style={{
                color: '#0284c7',
                fontWeight: '500',
                textDecoration: 'none',
              }}
            >
              Sign up
            </Link>
          )}
        </p>
      </div>

      {/* M-Pesa Notice */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.5rem',
        border: '1px solid #bae6fd',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Smartphone size={16} color="#0284c7" />
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
            M-Pesa Users
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
          Link your M-Pesa number in your account settings for faster checkout and mobile payments.
        </p>
      </div>
    </div>
  );
}