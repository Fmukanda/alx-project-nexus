// frontend/app/checkout/page.tsx
'use client';

import React, { useState } from 'react';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderReview } from '@/components/checkout/OrderReview';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { useCart } from '@/providers/CartProvider';

const steps = ['Shipping', 'Payment', 'Review', 'Confirmation'];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    shipping: {},
    payment: {},
  });
  const { state: cartState, dispatch } = useCart();

  const handleNext = (data: any) => {
    setOrderData(prev => ({
      ...prev,
      ...data,
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleOrderComplete = () => {
    // Clear cart after successful order
    dispatch({ type: 'CLEAR_CART' });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ShippingForm
            onNext={handleNext}
            initialData={orderData.shipping}
          />
        );
      case 2:
        return (
          <PaymentForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={orderData.payment}
          />
        );
      case 3:
        return (
          <OrderReview
            orderData={orderData}
            onNext={handleNext}
            onBack={handleBack}
            cartItems={cartState.items}
            total={cartState.total}
          />
        );
      case 4:
        return (
          <OrderConfirmation onOrderComplete={handleOrderComplete} />
        );
      default:
        return null;
    }
  };

  if (cartState.items.length === 0 && currentStep !== 4) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
          Your cart is empty
        </h2>
        <p style={{ color: '#6b7280' }}>
          Add some items to your cart before proceeding to checkout.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <CheckoutStepper currentStep={currentStep} steps={steps} />
      {renderStep()}
    </div>
  );
}