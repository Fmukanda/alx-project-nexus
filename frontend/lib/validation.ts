import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

export const shippingSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

export const paymentSchema = z.object({
  method: z.enum(['card', 'paypal', 'mpesa']),
  card_number: z.string().optional(),
  expiry_date: z.string().optional(),
  cvv: z.string().optional(),
  name_on_card: z.string().optional(),
  phone_number: z.string().optional(),
});

export const mpesaPaymentSchema = z.object({
  phone_number: z.string().min(10, 'Valid phone number is required'),
  order: z.string().uuid('Valid order ID is required'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Title is required'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  on_sale: z.boolean().optional(),
  in_stock: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type MpesaPaymentFormData = z.infer<typeof mpesaPaymentSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ProductFilterData = z.infer<typeof productFilterSchema>;