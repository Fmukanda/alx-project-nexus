'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        acceptTerms: true,
      });
      onSuccess?.();
      router.push('/auth/verify-email');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = {
    length: formData.password.length >= 6,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

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
          Create Account
        </h1>
        <p style={{ color: '#6b7280' }}>
          Join thousands of fashion enthusiasts
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              First Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User 
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
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Last Name *
            </label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Email Address *
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
            Phone Number
          </label>
          <div style={{ position: 'relative' }}>
            <Phone 
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
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 712 345 678"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Optional - Add for M-Pesa payments
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Password *
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
              placeholder="Create a password"
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

          {/* Password Strength Indicator */}
          {formData.password && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Password strength:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {[
                  { key: 'length', text: 'At least 6 characters', met: passwordStrength.length },
                  { key: 'uppercase', text: 'One uppercase letter', met: passwordStrength.uppercase },
                  { key: 'lowercase', text: 'One lowercase letter', met: passwordStrength.lowercase },
                  { key: 'number', text: 'One number', met: passwordStrength.number },
                ].map((rule) => (
                  <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check 
                      size={16} 
                      color={rule.met ? '#10b981' : '#9ca3af'} 
                    />
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: rule.met ? '#10b981' : '#6b7280',
                    }}>
                      {rule.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Confirm Password *
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
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ marginTop: '0.25rem', width: '1rem', height: '1rem' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>
              I agree to the{' '}
              <Link href="/terms" style={{ color: '#0284c7', textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" style={{ color: '#0284c7', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{ width: '100%', marginBottom: '1.5rem' }}
          disabled={isLoading || !isPasswordStrong}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* Sign In Link */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Already have an account?{' '}
          {onSwitchToLogin ? (
            <button
              onClick={onSwitchToLogin}
              style={{
                color: '#0284c7',
                fontWeight: '500',
                textDecoration: 'none',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          ) : (
            <Link 
              href="/auth/login"
              style={{
                color: '#0284c7',
                fontWeight: '500',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}