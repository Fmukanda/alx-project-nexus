class AnalyticsService {
  private async trackEvent(event: string, data: any) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, data);
    }

    // Send to backend
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  trackPageView(productId?: string, categoryId?: string) {
    this.trackEvent('page_view', {
      product_id: productId,
      category_id: categoryId,
      page_location: window.location.href,
    });
  }

  trackProductView(productId: string) {
    this.trackEvent('view_item', {
      product_id: productId,
    });
  }

  trackAddToCart(productId: string, quantity: number, price: number) {
    this.trackEvent('add_to_cart', {
      product_id: productId,
      quantity,
      price,
      currency: 'USD',
    });
  }

  trackPurchase(orderId: string, total: number, items: any[]) {
    this.trackEvent('purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'USD',
      items: items.map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }

  trackSearch(searchTerm: string, resultsCount: number) {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }
}

export const analytics = new AnalyticsService();