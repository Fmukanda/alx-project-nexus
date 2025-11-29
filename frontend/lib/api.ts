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

  // ==================== AUTH ENDPOINTS ====================

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

  async logout(refreshToken: string) {
    return this.authenticatedRequest('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  // ==================== PASSWORD RESET ENDPOINTS ====================

  async requestPasswordReset(email: string) {
    return this.request('/auth/password/reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(uid: string, token: string, newPassword: string, confirmPassword: string) {
    return this.request('/auth/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({
        uid,
        token,
        new_password: newPassword,
        re_new_password: confirmPassword,
      }),
    });
  }
  
  // ==================== USER PROFILE ENDPOINTS ====================

  async getProfile() {
    return this.authenticatedRequest('/users/me/');
  }

  // Add the missing updateProfile method
  async updateProfile(userData: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    date_of_birth: string;
    avatar: string;
  }>) {
    return this.authenticatedRequest('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.authenticatedRequest('/auth/change_password/', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }),
    });
  }

  async getUserStats() {
    return this.authenticatedRequest('/users/stats/');
  }

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

  // ==================== PRODUCT ENDPOINTS ====================

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

  async getProduct(id: string) {
    return this.request(`/products/${id}/`);
  }

  async getProductBySlug(slug: string) {
    return this.request(`/products/${slug}/`);
  }

  async getFeaturedProducts() {
    return this.request('/products/featured/');
  }

  // ==================== CART ENDPOINTS ====================

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

  async updateCartItem(itemId: string, quantity: number) {
    return this.authenticatedRequest(`/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: string) {
    return this.authenticatedRequest(`/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.authenticatedRequest('/cart/clear/', {
      method: 'POST',
    });
  }

  // ==================== ORDER ENDPOINTS ====================

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

  async getOrders(params?: {
    page?: number;
    status?: string;
    ordering?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.authenticatedRequest(`/orders/?${queryParams}`);
  }

  async getOrder(orderId: string) {
    return this.authenticatedRequest(`/orders/${orderId}/`);
  }

  async getWishlist() {
    return this.authenticatedRequest('/wishlist/');
  }

  async addToWishlist(productId: string) {
    return this.authenticatedRequest('/wishlist/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.authenticatedRequest(`/wishlist/${productId}/`, {
      method: 'DELETE',
    });
  }

  async clearWishlist() {
    return this.authenticatedRequest('/wishlist/clear/', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();


