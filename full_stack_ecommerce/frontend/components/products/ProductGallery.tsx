'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImage {
  id: string;
  image: string;
  altText: string;
  isPrimary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const primaryImages = images.filter(img => img.isPrimary);
  const hasMultipleImages = images.length > 1;
  const selectedImage = images[selectedImageIndex] || images[0];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Main Image */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#f8fafc',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          cursor: isZoomed ? 'zoom-out' : 'zoom-in',
          aspectRatio: '1 / 1',
        }}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <img
          src={selectedImage.image}
          alt={selectedImage.altText || productName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isZoomed ? 'scale(2)' : 'scale(1)',
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Zoom Indicator */}
        {!isZoomed && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
          className="zoom-indicator"
          >
            <ZoomIn size={14} />
            Click to zoom
          </div>
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
                transition: 'all 0.2s ease',
                opacity: 0,
              }}
              className="nav-arrow"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
            >
              <ChevronLeft size={24} color="#374151" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '3rem',
                height: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
                transition: 'all 0.2s ease',
                opacity: 0,
              }}
              className="nav-arrow"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
            >
              <ChevronRight size={24} color="#374151" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}>
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {hasMultipleImages && (
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          padding: '0.25rem',
        }}>
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleImageClick(index)}
              style={{
                flex: '0 0 auto',
                width: '5rem',
                height: '5rem',
                backgroundColor: '#f8fafc',
                border: `2px solid ${selectedImageIndex === index ? '#0284c7' : '#e5e7eb'}`,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (selectedImageIndex !== index) {
                  e.currentTarget.style.borderColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedImageIndex !== index) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <img
                src={image.image}
                alt={image.altText || `${productName} - view ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .nav-arrow {
          opacity: 0;
        }
        .zoom-indicator {
          opacity: 0;
        }
        div:hover .nav-arrow {
          opacity: 1;
        }
        div:hover .zoom-indicator {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}