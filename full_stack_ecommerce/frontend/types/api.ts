import { User, AuthResponse, LoginCredentials, RegisterCredentials } from './user';
import { Product, ProductImage, ProductVariant, Category } from './product';
import { Order, OrderItem, ShippingAddress, OrderStatus, PaymentStatus } from './order';
import {
  PaymentMethod,
  CreditCardDetails,
  MpesaPaymentDetails,
  PaymentIntent,
  PaymentResult,
  BillingAddress,
  PaymentCreateRequest,
  PaymentCreateResponse,
  MpesaStkPushRequest,
  MpesaStkPushResponse,
  MpesaTransaction,
  MpesaCallbackPayload,
  SetupIntent,
  PaymentError,
  MpesaBalance,
  MpesaWebhookEvent
} from './payment';

// Generic API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  status: number;
  timestamp: string;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  on_sale?: boolean;
}

// Auth API Types
export interface LoginRequest extends LoginCredentials {}

export interface LoginResponse extends AuthResponse {}

export interface RegisterRequest extends RegisterCredentials {}

export interface RegisterResponse extends AuthResponse {}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirm: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// User API Types
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface UserProfileResponse {
  user: User;
  orders_count: number;
  wishlist_count: number;
  joined_days_ago: number;
}

// Address API Types
export interface Address {
  id: string;
  user: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing';
  created_at: string;
  updated_at: string;
}

export interface AddressCreateRequest {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  is_default?: boolean;
  address_type: 'shipping' | 'billing';
}

export interface AddressUpdateRequest extends Partial<AddressCreateRequest> {}

// Product API Types
export interface ProductListParams extends ListParams {
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  gender?: 'M' | 'W' | 'U';
  material?: string;
  sort_by?: 'name' | 'price' | 'created_at' | 'popularity' | 'rating';
  sort_order?: 'asc' | 'desc';
}

export interface ProductCreateRequest {
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  category: string;
  gender: 'M' | 'W' | 'U';
  brand: string;
  material: string;
  care_instructions: string;
  is_active: boolean;
  images: File[];
  variants: ProductVariantCreateRequest[];
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

export interface ProductVariantCreateRequest {
  size: string;
  color: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductReview {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreateRequest {
  product: string;
  order_item: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewUpdateRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

// Category API Types
export interface CategoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

export interface CategoryCreateRequest {
  name: string;
  slug: string;
  description: string;
  image?: File;
  is_active: boolean;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {
  id: string;
}

// Cart API Types
export interface CartItem {
  id: string;
  product: string;
  variant?: string;
  product_details: Product;
  variant_details?: ProductVariant;
  quantity: number;
  price: number;
  total_price: number;
  image_url: string;
  product_name: string;
  variant_options?: {
    size?: string;
    color?: string;
  };
}

export interface Cart {
  id: string;
  user?: string;
  items: CartItem[];
  items_count: number;
  total_price: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  grand_total: number;
  coupon_code?: string;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product: string;
  variant?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface RemoveCartItemRequest {
  item_id: string;
}

export interface ApplyCouponRequest {
  coupon_code: string;
}

export interface RemoveCouponRequest {
  coupon_code: string;
}

export interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  applicable_categories?: string[];
  excluded_products?: string[];
}

// Order API Types
export interface OrderCreateRequest {
  shipping_address: string;
  billing_address: string;
  payment_method?: string;
  payment_type?: 'card' | 'mpesa' | 'cash_on_delivery';
  use_wallet_balance?: boolean;
  notes?: string;
  save_shipping_address?: boolean;
  save_billing_address?: boolean;
}

export interface OrderListParams extends ListParams {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  ordering?: 'created_at' | 'total' | 'status';
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  tracking_number?: string;
  carrier?: string;
  notes?: string;
}

export interface OrderCancellationRequest {
  reason: string;
  notes?: string;
}

// Payment API Types
export interface PaymentInitRequest {
  order: string;
  payment_method?: string;
  save_payment_method?: boolean;
  return_url: string;
  cancel_url: string;
}

export interface PaymentConfirmRequest {
  payment_intent_id: string;
  payment_method_id?: string;
}

export interface MpesaPaymentRequest {
  order: string;
  phone_number: string;
  amount: number;
  callback_url?: string;
}

export interface MpesaPaymentResponse {
  checkout_request_id: string;
  merchant_request_id: string;
  response_code: string;
  response_description: string;
  customer_message: string;
  order: string;
}

export interface MpesaPaymentStatusRequest {
  checkout_request_id: string;
}

export interface MpesaPaymentStatusResponse {
  transaction: MpesaTransaction;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
}

export interface PaymentMethodCreateRequest {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'mpesa';
  card_details?: CreditCardDetails;
  mpesa_details?: {
    phone_number: string;
  };
  is_default?: boolean;
}

export interface PaymentMethodUpdateRequest {
  is_default?: boolean;
}

// Wishlist API Types
export interface WishlistItem {
  id: string;
  product: string;
  product_details: Product;
  added_at: string;
}

export interface AddToWishlistRequest {
  product: string;
}

export interface RemoveFromWishlistRequest {
  product: string;
}

// Search API Types
export interface SearchParams {
  q: string;
  category?: string;
  brand?: string;
  gender?: 'M' | 'W' | 'U';
  price_min?: number;
  price_max?: number;
  size?: string;
  color?: string;
  in_stock?: boolean;
  on_sale?: boolean;
  sort_by?: 'relevance' | 'price' | 'name' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface SearchResponse {
  products: Product[];
  categories: Category[];
  brands: string[];
  filters: {
    price_range: {
      min: number;
      max: number;
    };
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
    }>;
    brands: Array<{
      name: string;
      count: number;
    }>;
    sizes: string[];
    colors: string[];
  };
  total_count: number;
  page: number;
  total_pages: number;
}

// Analytics API Types
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_change_percentage: number;
  orders_change_percentage: number;
  customers_change_percentage: number;
  products_change_percentage: number;
  mpesa_transactions_count: number;
  mpesa_revenue: number;
  average_order_value: number;
  conversion_rate: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  mpesa_orders: number;
  card_orders: number;
  average_order_value: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  revenue: number;
  units_sold: number;
  image_url: string;
  category: string;
}

export interface CustomerStats {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_acquisition_cost: number;
  customer_lifetime_value: number;
}

// File Upload Types
export interface FileUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface MultipleFileUploadResponse {
  files: FileUploadResponse[];
}

// Notification API Types
export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'payment';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  promotions: boolean;
  price_drops: boolean;
  stock_notifications: boolean;
  security_alerts: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  preferences: Partial<NotificationPreferences>;
}

// Admin API Types
export interface AdminStats {
  dashboard: DashboardStats;
  recent_orders: Order[];
  top_products: TopProduct[];
  sales_chart: SalesData[];
}

export interface AdminUserListParams extends ListParams {
  is_active?: boolean;
  is_staff?: boolean;
  date_joined_from?: string;
  date_joined_to?: string;
}

export interface AdminOrderListParams extends OrderListParams {
  user?: string;
  payment_method?: string;
}

// Export all types for easy access
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Product,
  ProductImage,
  ProductVariant,
  Category,
  Order,
  OrderItem,
  ShippingAddress,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  CreditCardDetails,
  MpesaPaymentDetails,
  PaymentIntent,
  PaymentResult,
  BillingAddress,
  PaymentCreateRequest,
  PaymentCreateResponse,
  MpesaStkPushRequest,
  MpesaStkPushResponse,
  MpesaTransaction,
  MpesaCallbackPayload,
  SetupIntent,
  PaymentError,
  MpesaBalance,
  MpesaWebhookEvent
};