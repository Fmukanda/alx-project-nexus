'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

interface ResetPasswordFormProps {
  onBackToLogin?: () => void;
}

export function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { requestPasswordReset } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    await requestPasswordReset(email);
    setIsSubmitted(true);
  } catch (err: any) {
    setError(err.message || 'Failed to send reset instructions. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  if (isSubmitted) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        {/* Success State */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <CheckCircle size={32} color="#10b981" />
          </div>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            Check Your Email
          </h1>
          <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
            We've sent password reset instructions to{' '}
            <strong style={{ color: '#374151' }}>{email}</strong>. 
            Please check your inbox and follow the link to reset your password.
          </p>
        </div>

        {/* Additional Help */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
            Didn't receive the email?
          </p>
          <ul style={{ fontSize: '0.75rem', color: '#64748b', paddingLeft: '1rem' }}>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {onBackToLogin ? (
            <Button
              type="button"
              variant="outline"
              onClick={onBackToLogin}
              style={{ flex: 1 }}
              icon={<ArrowLeft size={16} />}
            >
              Back to Login
            </Button>
          ) : (
            <Link href="/auth/login" style={{ flex: 1 }}>
              <Button
                type="button"
                variant="outline"
                style={{ width: '100%' }}
                icon={<ArrowLeft size={16} />}
              >
                Back to Login
              </Button>
            </Link>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            style={{ flex: 1 }}
          >
            Try Another Email
          </Button>
        </div>
      </div>
    );
  }

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
          Reset Password
        </h1>
        <p style={{ color: '#6b7280' }}>
          Enter your email to receive reset instructions
        </p>
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

      {/* Reset Form */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{ width: '100%', marginBottom: '1.5rem' }}
          disabled={isLoading}
        >
          {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
        </Button>
      </form>

      {/* Back to Login */}
      <div style={{ textAlign: 'center' }}>
        {onBackToLogin ? (
          <button
            onClick={onBackToLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              color: '#0284c7',
              fontWeight: '500',
              textDecoration: 'none',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        ) : (
          <Link 
            href="/auth/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
              color: '#0284c7',
              fontWeight: '500',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        )}
      </div>

      {/* Security Notice */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        borderRadius: '0.5rem',
        border: '1px solid #bae6fd',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertCircle size={16} color="#0284c7" />
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
            Security Notice
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
          For security reasons, the reset link will expire in 1 hour. 
          If you didn't request this reset, you can safely ignore this email.
        </p>
      </div>
    </div>
  );
}