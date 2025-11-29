'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Check, Shield, Truck, CreditCard } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';

interface OrderReviewProps {
  orderData: {
    shipping: any;
    payment: any;
  };
  onNext: (data: any) => void;
  onBack: () => void;
  cartItems: any[];
  total: number;
}

export function OrderReview({ orderData, onNext, onBack, cartItems, total }: OrderReviewProps) {
  const { state: cartState } = useCart();

  const calculateTotals = () => {
    const subtotal = cartState.total;
    const shippingCost = orderData.shipping?.shippingMethod === 'express' ? 15 : 10;
    const tax = subtotal * 0.08; // 8% tax
    const grandTotal = subtotal + shippingCost + tax;

    return {
      subtotal,
      shippingCost,
      tax,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const handlePlaceOrder = () => {
    // In a real app, you would send the order to your backend
    const orderPayload = {
      shipping: orderData.shipping,
      payment: orderData.payment,
      items: cartItems,
      totals: totals,
      orderDate: new Date().toISOString(),
    };

    console.log('Placing order:', orderPayload);
    
    // Simulate API call
    setTimeout(() => {
      onNext({
        orderId: `ORD-${Date.now()}`,
        ...orderPayload,
        orderDate: new Date().toISOString(),
      });
    }, 1000);
  };

  const formatPaymentMethod = (payment: any) => {
    if (!payment) return 'Not selected';
    
    switch (payment.method) {
      case 'card':
        return `Credit Card ending in ${payment.cardNumber?.slice(-4)}`;
      case 'paypal':
        return 'PayPal';
      case 'mpesa':
        return `M-Pesa (${payment.phoneNumber})`;
      default:
        return payment.method;
    }
  };

  const formatAddress = (shipping: any) => {
    if (!shipping) return 'Not provided';
    
    return `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}`;
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>
        Order Review
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Order Summary */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Order Summary
          </h3>
          
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <img
                  src={item.image_url || '/images/placeholder-product.jpg'}
                  alt={item.product_name}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '0.375rem',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    {item.product_name}
                  </h4>
                  {item.variant_options && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {Object.values(item.variant_options).join(', ')}
                    </p>
                  )}
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Qty: {item.quantity}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600', color: '#374151' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Order Details
          </h3>

          {/* Shipping Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Truck size={18} color="#6b7280" />
              <h4 style={{ fontWeight: '600', color: '#374151' }}>Shipping Address</h4>
            </div>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ fontWeight: '500', color: '#374151' }}>
                {orderData.shipping?.firstName} {orderData.shipping?.lastName}
              </p>
              <p style={{ color: '#6b7280' }}>{formatAddress(orderData.shipping)}</p>
              {orderData.shipping?.phone && (
                <p style={{ color: '#6b7280' }}>Phone: {orderData.shipping.phone}</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CreditCard size={18} color="#6b7280" />
              <h4 style={{ fontWeight: '600', color: '#374151' }}>Payment Method</h4>
            </div>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ color: '#374151' }}>{formatPaymentMethod(orderData.payment)}</p>
            </div>
          </div>

          {/* Order Totals */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Order Total</h4>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ color: '#374151' }}>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Shipping</span>
                <span style={{ color: '#374151' }}>${totals.shippingCost.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Tax</span>
                <span style={{ color: '#374151' }}>${totals.tax.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0',
                fontWeight: '600'
              }}>
                <span style={{ color: '#374151' }}>Total</span>
                <span style={{ color: '#111827', fontSize: '1.125rem' }}>
                  ${totals.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={16} color="#0284c7" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0369a1' }}>
                100% Secure Checkout
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#0369a1', lineHeight: '1.4' }}>
              Your order is protected by industry-standard SSL encryption. 
              We never store your full payment details on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            defaultChecked
            style={{ marginTop: '0.25rem', width: '1rem', height: '1rem' }}
          />
          <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>
            I agree to the Terms of Service and Privacy Policy. I understand that my order 
            is subject to availability and confirmation. Returns are accepted within 30 days 
            of delivery for unworn items with original tags.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          style={{ flex: 1 }}
        >
          Back to Payment
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handlePlaceOrder}
          style={{ flex: 1 }}
          icon={<Check size={18} />}
        >
          Place Order
        </Button>
      </div>
    </div>
  );
}