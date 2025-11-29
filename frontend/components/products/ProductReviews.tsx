'use client';

import { useState, useEffect } from 'react';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user: {
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  onAddReview?: (review: { rating: number; title: string; comment: string }) => void;
}

// Mock data - replace with actual API calls
const mockReviews: Review[] = [
  {
    id: '1',
    rating: 5,
    title: 'Excellent product!',
    comment: 'This product exceeded my expectations. The quality is amazing and it arrived quickly.',
    user: {
      first_name: 'John',
      last_name: 'Doe',
      avatar: '/avatars/john-doe.jpg'
    },
    is_verified: true,
    helpful_count: 12,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    rating: 4,
    title: 'Great value for money',
    comment: 'Good quality product at a reasonable price. Would recommend to others.',
    user: {
      first_name: 'Sarah',
      last_name: 'Smith'
    },
    is_verified: true,
    helpful_count: 5,
    created_at: '2024-01-10T14:20:00Z'
  }
];

export function ProductReviews({ productId, onAddReview }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch reviews when component mounts or productId changes
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call
        // const response = await apiClient.getReviews(productId);
        // setReviews(response.reviews);
        // setAverageRating(response.averageRating);
        // setTotalReviews(response.totalReviews);
        
        // Using mock data for now
        setReviews(mockReviews);
        setAverageRating(4.5);
        setTotalReviews(mockReviews.length);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(review => review.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(review => review.rating === stars).length / totalReviews) * 100 : 0,
  }));

  const handleHelpfulClick = (reviewId: string) => {
    // In a real app, this would call an API
    console.log('Marked review as helpful:', reviewId);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      // In a real app, this would call an API
      // await apiClient.submitReview(productId, newReview);
      
      // For now, just call the callback if provided
      onAddReview?.(newReview);
      
      // Reset form
      setNewReview({ rating: 0, title: '', comment: '' });
      setShowReviewForm(false);
      
      // Refetch reviews to get updated data
      // await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '2rem',
        }}>
          Customer Reviews
        </h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '3rem' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#111827',
        marginBottom: '2rem',
      }}>
        Customer Reviews
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '3rem',
        marginBottom: '3rem',
      }}>
        {/* Rating Summary */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              {averageRating.toFixed(1)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  color="#f59e0b"
                  fill={i < Math.floor(averageRating) ? '#f59e0b' : 'none'}
                />
              ))}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#374151', minWidth: '1.5rem' }}>
                  {stars}
                </span>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <div style={{
                  flex: 1,
                  height: '0.5rem',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '0.25rem',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#f59e0b',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', minWidth: '2rem' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form / Write Review Button */}
        <div>
          {!showReviewForm ? (
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                Share Your Experience
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Help other customers make informed decisions by sharing your thoughts about this product.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1.5rem' }}>
                Write Your Review
              </h3>

              {/* Star Rating */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Your Rating *
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                    >
                      <Star
                        size={32}
                        color="#f59e0b"
                        fill={star <= (hoveredRating || newReview.rating) ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Input
                  type="text"
                  placeholder="Review title"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Review Comment */}
              <div style={{ marginBottom: '1.5rem' }}>
                <textarea
                  placeholder="Share your experience with this product..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 1 }}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            color: '#6b7280',
          }}>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={`${review.user.first_name} ${review.user.last_name}`}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={20} color="#6b7280" />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>
                        {review.user.first_name} {review.user.last_name}
                      </span>
                      {review.is_verified && (
                        <CheckCircle size={16} color="#10b981" />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.125rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            color="#f59e0b"
                            fill={i < review.rating ? '#f59e0b' : 'none'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <ThumbsUp size={16} />
                  Helpful ({review.helpful_count})
                </button>
              </div>

              {review.title && (
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}>
                  {review.title}
                </h4>
              )}

              {review.comment && (
                <p style={{
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Placeholder components - replace with your actual components
const Star = ({ size, color, fill }: { size: number; color: string; fill: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const User = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CheckCircle = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ThumbsUp = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const Button = ({ 
  variant, 
  onClick, 
  children, 
  type = 'button',
  style 
}: { 
  variant: 'primary' | 'outline';
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}) => (
  <button
    type={type}
    onClick={onClick}
    style={{
      padding: '0.75rem 1.5rem',
      border: variant === 'outline' ? '1px solid #d1d5db' : 'none',
      backgroundColor: variant === 'primary' ? '#0284c7' : 'transparent',
      color: variant === 'primary' ? 'white' : '#374151',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s',
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = variant === 'primary' ? '#0369a1' : '#f3f4f6';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = variant === 'primary' ? '#0284c7' : 'transparent';
    }}
  >
    {children}
  </button>
);

const Input = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  required 
}: { 
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    style={{
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    }}
    onFocus={(e) => {
      e.target.style.borderColor = '#0284c7';
    }}
    onBlur={(e) => {
      e.target.style.borderColor = '#d1d5db';
    }}
  />
);

/*'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Star, ThumbsUp, User, CheckCircle } from 'lucide-react';

interface Review {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  productId: string;
  averageRating: number;
  totalReviews: number;
  onAddReview?: (review: { rating: number; title: string; comment: string }) => void;
}

export function ProductReviews({ 
  reviews, 
  productId, 
  averageRating, 
  totalReviews,
  onAddReview 
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(review => review.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(review => review.rating === stars).length / totalReviews) * 100 : 0,
  }));

  const handleHelpfulClick = (reviewId: string) => {
    // In a real app, this would call an API
    console.log('Marked review as helpful:', reviewId);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      alert('Please select a rating');
      return;
    }
    onAddReview?.(newReview);
    setNewReview({ rating: 0, title: '', comment: '' });
    setShowReviewForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={{ marginTop: '3rem' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#111827',
        marginBottom: '2rem',
      }}>
        Customer Reviews
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '3rem',
        marginBottom: '3rem',
      }}>
        /* Rating Summary */
        /*<div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              {averageRating.toFixed(1)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  color="#f59e0b"
                  fill={i < Math.floor(averageRating) ? '#f59e0b' : 'none'}
                />
              ))}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          /* Rating Distribution */
          /*<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#374151', minWidth: '1.5rem' }}>
                  {stars}
                </span>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <div style={{
                  flex: 1,
                  height: '0.5rem',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '0.25rem',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: '#f59e0b',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', minWidth: '2rem' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        /* Review Form / Write Review Button */
        /*<div>
          {!showReviewForm ? (
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '2rem',
              borderRadius: '0.75rem',
              textAlign: 'center',
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                Share Your Experience
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Help other customers make informed decisions by sharing your thoughts about this product.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1.5rem' }}>
                Write Your Review
              </h3>

              {/* Star Rating */
              /*<div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Your Rating *
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                    >
                      <Star
                        size={32}
                        color="#f59e0b"
                        fill={star <= (hoveredRating || newReview.rating) ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              /* Review Title */
              /*<div style={{ marginBottom: '1.5rem' }}>
                <Input
                  type="text"
                  placeholder="Review title"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              /* Review Comment */
              /*<div style={{ marginBottom: '1.5rem' }}>
                <textarea
                  placeholder="Share your experience with this product..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0284c7';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 1 }}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      /* Reviews List */
      /*<div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            color: '#6b7280',
          }}>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={`${review.user.first_name} ${review.user.last_name}`}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={20} color="#6b7280" />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>
                        {review.user.first_name} {review.user.last_name}
                      </span>
                      {review.is_verified && (
                        <CheckCircle size={16} color="#10b981" />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.125rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            color="#f59e0b"
                            fill={i < review.rating ? '#f59e0b' : 'none'}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleHelpfulClick(review.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <ThumbsUp size={16} />
                  Helpful ({review.helpful_count})
                </button>
              </div>

              {review.title && (
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem',
                }}>
                  {review.title}
                </h4>
              )}

              {review.comment && (
                <p style={{
                  color: '#374151',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}*/