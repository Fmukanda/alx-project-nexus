const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log("API Request:", url, config.method);
    
    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token might be expired, you could implement token refresh here
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.error || errorData.detail || `API Error: ${response.status} ${response.statusText}`,
          status: response.status,
          details: errorData
        };
        throw error;
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private async authenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    return this.request(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  }

  // ... (Keep all your existing auth, product, cart, order methods as they are)

  // ==================== PAYMENT ENDPOINTS ====================

  // Payment Methods
  async getPaymentMethods() {
    return this.authenticatedRequest('/payments/methods/');
  }

  async createPaymentMethod(paymentMethodData: {
    type: 'card' | 'mpesa' | 'paypal';
    card?: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
      name: string;
    };
    is_default?: boolean;
  }) {
    return this.authenticatedRequest('/payments/methods/', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
  }

  async deletePaymentMethod(paymentMethodId: string) {
    return this.authenticatedRequest(`/payments/methods/${paymentMethodId}/`, {
      method: 'DELETE',
    });
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    return this.authenticatedRequest(`/payments/methods/${paymentMethodId}/set_default/`, {
      method: 'PATCH',
    });
  }

  // Payment Creation and Management
  async createPayment(paymentData: {
    order: string;
    payment_method?: string;
    save_payment_method?: boolean;
  }) {
    return this.authenticatedRequest('/payments/create/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async confirmPayment(paymentId: string, paymentIntent?: string) {
    return this.authenticatedRequest(`/payments/${paymentId}/confirm/`, {
      method: 'POST',
      body: JSON.stringify({ payment_intent: paymentIntent }),
    });
  }

  async getPayment(paymentId: string) {
    return this.authenticatedRequest(`/payments/${paymentId}/`);
  }

  async cancelPayment(paymentId: string) {
    return this.authenticatedRequest(`/payments/${paymentId}/cancel/`, {
      method: 'POST',
    });
  }

  // M-Pesa Specific Payments
  async initiateMpesaPayment(paymentData: {
    phone_number: string;
    amount: number;
    order?: string;
  }) {
    return this.authenticatedRequest('/payments/mpesa/initiate/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async confirmMpesaPayment(transactionId: string) {
    return this.authenticatedRequest(`/payments/mpesa/${transactionId}/confirm/`, {
      method: 'POST',
    });
  }

  async getMpesaTransactions(params?: {
    page?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.authenticatedRequest(`/payments/mpesa/transactions/?${queryParams}`);
  }

  // Payment Status and History
  async getPaymentStatus(orderId: string) {
    return this.authenticatedRequest(`/payments/status/${orderId}/`);
  }

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.authenticatedRequest(`/payments/history/?${queryParams}`);
  }

  // Refunds
  async createRefund(refundData: {
    order: string;
    amount: number;
    reason: string;
  }) {
    return this.authenticatedRequest('/payments/refunds/', {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  async getRefunds() {
    return this.authenticatedRequest('/payments/refunds/');
  }

  async getRefund(refundId: string) {
    return this.authenticatedRequest(`/payments/refunds/${refundId}/`);
  }

  // Payment Webhooks (for client-side verification)
  async verifyWebhookSignature(payload: any, signature: string) {
    return this.request('/payments/webhook/verify/', {
      method: 'POST',
      body: JSON.stringify({ payload, signature }),
    });
  }

  // Payment Configuration
  async getPaymentConfig() {
    return this.request('/payments/config/');
  }

  // ==================== EXISTING METHODS (Keep all your existing methods below) ====================

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    phone?: string;
  }) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ... (Keep all your existing methods for products, cart, orders, etc.)

  async getProducts(params?: {
    category?: string;
    gender?: string;
    brand?: string;
    search?: string;
    ordering?: string;
    page?: number;
    featured?: boolean;
    price_min?: number;
    price_max?: number;
    in_stock?: boolean;
    on_sale?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/products/?${queryParams}`);
  }

  async getCart() {
    return this.authenticatedRequest('/cart/');
  }

  async addToCart(itemData: {
    product: string;
    variant?: string;
    quantity: number;
  }) {
    return this.authenticatedRequest('/cart/items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async createOrder(orderData: {
    shipping_address: string;
    billing_address: string;
    payment_method?: string;
    notes?: string;
  }) {
    return this.authenticatedRequest('/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // ... (Continue with all your existing methods)
}

export const apiClient = new ApiClient();