export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'mpesa';
  provider: 'stripe' | 'paypal' | 'apple' | 'google' | 'mpesa';
  is_default: boolean;
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  brand?: string;
  name?: string;
  paypal_email?: string;
  mpesa_phone?: string; // M-Pesa registered phone number
  created_at: string;
  updated_at: string;
}

export interface CreditCardDetails {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvc: string;
  name_on_card: string;
  save_card: boolean;
}

export interface MpesaPaymentDetails {
  phone_number: string; // Format: 254712345678
  amount: number;
  reference?: string; // Optional transaction reference
  description?: string; // Payment description
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'pending'; // Added pending for M-Pesa
  amount: number;
  currency: string;
  payment_method_types: string[];
  created_at: string;
  mpesa_checkout_request_id?: string; // M-Pesa specific identifier
}

export interface PaymentResult {
  id: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled' | 'processing';
  amount: number;
  currency: string;
  payment_method: string;
  payment_method_details: {
    type: string;
    card?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
    paypal?: {
      email: string;
    };
    mpesa?: {
      phone_number: string;
      transaction_id: string;
      receipt_number?: string;
    };
  };
  created_at: string;
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface PaymentCreateRequest {
  order_id: string;
  payment_method_id?: string;
  payment_intent_id?: string;
  save_payment_method: boolean;
  billing_address: BillingAddress;
  mpesa_details?: MpesaPaymentDetails; // M-Pesa specific details
}

export interface PaymentCreateResponse {
  payment_intent?: PaymentIntent;
  requires_action?: boolean;
  payment_status: string;
  client_secret?: string;
  mpesa_checkout_request_id?: string; // M-Pesa checkout request ID
  mpesa_response_description?: string; // M-Pesa API response description
  error?: string;
}

export interface MpesaStkPushRequest {
  phone_number: string;
  amount: number;
  account_reference?: string;
  transaction_desc?: string;
  callback_url?: string;
}

export interface MpesaStkPushResponse {
  merchant_request_id: string;
  checkout_request_id: string;
  response_code: string;
  response_description: string;
  customer_message: string;
}

export interface MpesaTransaction {
  id: string;
  transaction_id: string;
  receipt_number?: string;
  phone_number: string;
  amount: number;
  account_reference: string;
  transaction_desc: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  result_code?: string;
  result_description?: string;
  created_at: string;
  completed_at?: string;
}

export interface MpesaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface SetupIntent {
  id: string;
  client_secret: string;
  status: string;
  payment_method_types: string[];
  created_at: string;
}

export interface PaymentError {
  code: string;
  message: string;
  type: 'validation_error' | 'api_error' | 'card_error' | 'mpesa_error';
  param?: string;
}

export interface MpesaBalance {
  balance: number;
  currency: string;
  updated_at: string;
}

export interface MpesaWebhookEvent {
  id: string;
  event_type: 'payment_completed' | 'payment_failed' | 'payment_pending';
  data: MpesaTransaction;
  created_at: string;
}