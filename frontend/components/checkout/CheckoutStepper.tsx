'use client';

import React from 'react';

interface CheckoutStepperProps {
  currentStep: number;
  steps: string[];
}

export function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '3rem',
      position: 'relative',
    }}>
      {/* Progress line */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '0',
        right: '0',
        height: '2px',
        backgroundColor: '#e5e7eb',
        zIndex: 1,
      }} />
      
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '0',
        height: '2px',
        backgroundColor: '#0284c7',
        zIndex: 2,
        transition: 'width 0.3s',
        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
      }} />

      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: isCompleted || isActive ? '#0284c7' : '#e5e7eb',
              color: isCompleted || isActive ? 'white' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              transition: 'all 0.3s',
            }}>
              {isCompleted ? '✓' : stepNumber}
            </div>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? '#0284c7' : '#6b7280',
              textAlign: 'center',
            }}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}