'use client';

import React from 'react';

export default function checkOutPage() {
  return <div>Chakeout Page</div>;
}

/*'use client';

import React, { useState } from 'react';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderReview } from '@/components/checkout/OrderReview';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { PaymentProcessing } from '@/components/checkout/PaymentProcessing';
import { useCart } from '@/providers/CartProvider';
import { usePayment } from '@/hooks/usePayment';

const steps = ['Shipping', 'Payment', 'Review', 'Confirmation'];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    shipping: {},
    payment: {},
    order: null as any,
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { state: cartState, dispatch } = useCart();
  const { createPayment, confirmPayment } = usePayment();

  const handleNext = async (data: any) => {
    if (currentStep === 3) { // Review step - process payment
      setIsProcessingPayment(true);
      try {
        // Create order first (you would have an API endpoint for this)
        const order = await createOrder();
        
        // Process payment
        const payment = await createPayment(order.id, data.paymentMethodId, data.savePaymentMethod);
        
        // Confirm payment
        await confirmPayment(payment.id);
        
        setOrderData(prev => ({ ...prev, order }));
        setCurrentStep(4); // Success
      } catch (error) {
        console.error('Payment failed:', error);
        // Handle payment failure
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }
    
    setOrderData(prev => ({
      ...prev,
      ...data,
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const createOrder = async () => {
    // Mock order creation - in real app, call your API
    return {
      id: 'order_' + Date.now(),
      orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      total: cartState.total,
      items: cartState.items,
    };
  };

  const handleOrderComplete = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  if (isProcessingPayment) {
    return <PaymentProcessing />;
  }

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
          <OrderConfirmation 
            //order={orderData.order}
            onOrderComplete={handleOrderComplete} 
          />
        );
      default:
        return null;
    }
  };

  // ... rest of the component
}*/