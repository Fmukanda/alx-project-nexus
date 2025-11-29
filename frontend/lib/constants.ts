// frontend/lib/constants.ts
export const APP_CONFIG = {
  name: 'Hangazo Fashion House',
  description: 'Modern Ecommerce Platform',
  version: '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  MPESA: 'mpesa',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const PRODUCT_CATEGORIES = {
  MEN: 'men',
  WOMEN: 'women',
  KIDS: 'kids',
  ACCESSORIES: 'accessories',
  SHOES: 'shoes',
} as const;

export const CURRENCY = {
  USD: 'USD',
  KES: 'KES',
  EUR: 'EUR',
} as const;

export const SHIPPING_COST = 9.99;
export const TAX_RATE = 0.08; // 8%

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;