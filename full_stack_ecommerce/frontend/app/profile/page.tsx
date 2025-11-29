'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { apiClient } from '@/lib/api';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  date_of_birth: string;
}

export default function ProfilePage() {
  const { state: authState, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (authState.user) {
      setFormData({
        first_name: authState.user.first_name || '',
        last_name: authState.user.last_name || '',
        phone: authState.user.phone || '',
        address: authState.user.address || '',
        date_of_birth: authState.user.date_of_birth || '',
      });
    }
  }, [authState.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    
    try {
      // Use apiClient to update profile
      await apiClient.updateProfile(formData);
      // Note: In a real app, you might want to refresh the user data in AuthProvider
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (authState.user) {
      setFormData({
        first_name: authState.user.first_name || '',
        last_name: authState.user.last_name || '',
        phone: authState.user.phone || '',
        address: authState.user.address || '',
        date_of_birth: authState.user.date_of_birth || '',
      });
    }
  };

  if (authState.isLoading) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.gray[50],
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: theme.colors.gray[600],
        }}>
          <div style={{
            width: '1.5rem',
            height: '1.5rem',
            border: `2px solid ${theme.colors.gray[300]}`,
            borderTop: `2px solid ${theme.colors.primary[600]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!authState.user) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.gray[50],
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: theme.colors.gray[900],
            marginBottom: '0.5rem',
          }}>
            Profile
          </h1>
          <p style={{ color: theme.colors.gray[600] }}>
            Manage your account settings and preferences
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Main Content */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${theme.colors.gray[200]}`,
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: theme.colors.gray[900],
                }}>
                  Personal Information
                </h2>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '1.5rem',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}>
                    <div>
                      <label htmlFor="first_name" style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: theme.colors.gray[700],
                        marginBottom: '0.5rem',
                      }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${theme.colors.gray[300]}`,
                          borderRadius: theme.borderRadius.md,
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: !isEditing ? theme.colors.gray[50] : 'white',
                          color: !isEditing ? theme.colors.gray[500] : theme.colors.gray[900],
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="last_name" style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: theme.colors.gray[700],
                        marginBottom: '0.5rem',
                      }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${theme.colors.gray[300]}`,
                          borderRadius: theme.borderRadius.md,
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          backgroundColor: !isEditing ? theme.colors.gray[50] : 'white',
                          color: !isEditing ? theme.colors.gray[500] : theme.colors.gray[900],
                        }}
                      />
                    </div>
                  </div>

                  <div>
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
                      type="email"
                      id="email"
                      value={authState.user.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${theme.colors.gray[300]}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: '1rem',
                        backgroundColor: theme.colors.gray[50],
                        color: theme.colors.gray[500],
                      }}
                    />
                    <p style={{
                      marginTop: '0.5rem',
                      fontSize: '0.875rem',
                      color: authState.user.email_verified ? theme.colors.green[600] : theme.colors.orange[600],
                    }}>
                      {authState.user.email_verified ? '✓ Email verified' : '⚠ Email not verified'}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phone" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: theme.colors.gray[700],
                      marginBottom: '0.5rem',
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${theme.colors.gray[300]}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: !isEditing ? theme.colors.gray[50] : 'white',
                        color: !isEditing ? theme.colors.gray[500] : theme.colors.gray[900],
                      }}
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="date_of_birth" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: theme.colors.gray[700],
                      marginBottom: '0.5rem',
                    }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${theme.colors.gray[300]}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: !isEditing ? theme.colors.gray[50] : 'white',
                        color: !isEditing ? theme.colors.gray[500] : theme.colors.gray[900],
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="address" style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: theme.colors.gray[700],
                      marginBottom: '0.5rem',
                    }}>
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: `1px solid ${theme.colors.gray[300]}`,
                        borderRadius: theme.borderRadius.md,
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: !isEditing ? theme.colors.gray[50] : 'white',
                        color: !isEditing ? theme.colors.gray[500] : theme.colors.gray[900],
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                      placeholder="Enter your full address"
                    />
                  </div>

                  {isEditing && (
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={saveLoading}
                      >
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Account Status */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: theme.colors.gray[900],
                marginBottom: '1rem',
              }}>
                Account Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.gray[600] }}>Member since</span>
                  <span style={{ fontWeight: '500' }}>
                    {new Date(authState.user.date_joined).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: theme.colors.gray[600] }}>Email verified</span>
                  <span style={{ 
                    fontWeight: '500',
                    color: authState.user.email_verified ? theme.colors.green[600] : theme.colors.orange[600],
                  }}>
                    {authState.user.email_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {authState.user.is_staff && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: theme.colors.gray[600] }}>Role</span>
                    <span style={{ fontWeight: '500', color: theme.colors.blue[600] }}>
                      Staff
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: theme.colors.gray[900],
                marginBottom: '1rem',
              }}>
                Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {!isEditing && (
                  <Button
                    variant="outline"
                    style={{ width: '100', justifyContent: 'center' }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => router.push('/auth/change-password')}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  style={{ 
                    width: '100%', 
                    justifyContent: 'center',
                    color: theme.colors.red[600],
                    borderColor: theme.colors.red[300],
                  }}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}