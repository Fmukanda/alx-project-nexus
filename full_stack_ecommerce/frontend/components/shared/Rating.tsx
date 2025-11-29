import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  className?: string;
}

export function Rating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  onChange,
  readonly = false,
  className = '',
}: RatingProps) {
  const sizeStyles = {
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 },
    lg: { width: 24, height: 24 },
  };

  const handleClick = (newRating: number) => {
    if (!readonly && onChange) {
      onChange(newRating);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, newRating: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(newRating);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    }} className={className}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: '0.125rem' }}>
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          const isHalf = !isFilled && starValue - 0.5 <= rating;

          return (
            <button
              key={index}
              onClick={() => handleClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              style={{
                background: 'none',
                border: 'none',
                cursor: readonly ? 'default' : 'pointer',
                padding: '0.125rem',
                color: isFilled ? '#f59e0b' : isHalf ? '#f59e0b' : '#d1d5db',
                transition: 'color 0.2s',
              }}
              disabled={readonly}
              aria-label={`Rate ${starValue} out of ${maxRating}`}
            >
              <Star
                size={sizeStyles[size].width}
                fill={isFilled || isHalf ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>

      {/* Rating value */}
      {showValue && (
        <span style={{
          fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
          color: '#6b7280',
          marginLeft: '0.5rem',
        }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface RatingDistributionProps {
  ratings: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalReviews: number;
  averageRating: number;
}

export function RatingDistribution({
  ratings,
  totalReviews,
  averageRating,
}: RatingDistributionProps) {
  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Average rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {averageRating.toFixed(1)}
          </div>
          <Rating rating={averageRating} readonly />
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Distribution bars */}
      {[5, 4, 3, 2, 1].map((stars) => (
        <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#374151',
            minWidth: '1.5rem',
          }}>
            {stars}
          </div>
          <Star size={16} color="#f59e0b" fill="#f59e0b" />
          <div style={{ 
            flex: 1,
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: '#f59e0b',
                width: `${getPercentage(ratings[stars as keyof typeof ratings])}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280',
            minWidth: '2rem',
            textAlign: 'right',
          }}>
            {ratings[stars as keyof typeof ratings]}
          </div>
        </div>
      ))}
    </div>
  );
}