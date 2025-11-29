'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  image_url: string;
  slug?: string;
  in_stock?: boolean;
  added_at: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_SYNCED'; payload: boolean };

interface WishlistContextType {
  state: WishlistState;
  // Public API methods
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  syncWishlist: () => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  // Dispatch for advanced usage
  dispatch: React.Dispatch<WishlistAction>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Wishlist reducer
function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_WISHLIST':
      return { 
        ...state, 
        items: action.payload,
        isSynced: true,
      };
    
    case 'ADD_ITEM':
      // Prevent duplicates
      if (state.items.find(item => item.product_id === action.payload.product_id)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload),
      };
    
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        isSynced: true,
      };
    
    case 'SET_SYNCED':
      return {
        ...state,
        isSynced: action.payload,
      };
    
    default:
      return state;
  }
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
  isSynced: false,
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const loadWishlistFromStorage = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          const wishlistData = JSON.parse(savedWishlist);
          dispatch({ type: 'SET_WISHLIST', payload: wishlistData.items || [] });
        }
      } catch (error) {
        console.error('Error loading wishlist from storage:', error);
      }
    };

    loadWishlistFromStorage();
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify({
      items: state.items,
      lastUpdated: new Date().toISOString(),
    }));
  }, [state.items]);

  // Sync wishlist with server when user is authenticated
  const syncWishlist = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      const serverWishlist = await apiClient.getWishlist();
      dispatch({ type: 'SET_WISHLIST', payload: serverWishlist });
    } catch (error) {
      console.error('Error syncing wishlist with server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addToWishlist = useCallback(async (product: any) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const wishlistItem: WishlistItem = {
        id: Date.now().toString(),
        product_id: product.id,
        product_name: product.name,
        price: product.onSale ? product.salePrice! : product.price,
        image_url: product.images[0]?.image || '/images/placeholder-product.jpg',
        slug: product.slug,
        in_stock: product.isActive,
        added_at: new Date().toISOString(),
      };

      // If user is authenticated, sync with server
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.addToWishlist(product.id);
        await syncWishlist();
      } else {
        // Use local storage for guest users
        dispatch({ type: 'ADD_ITEM', payload: wishlistItem });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [syncWishlist]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      // If user is authenticated, sync with server
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.removeFromWishlist(productId);
        await syncWishlist();
      } else {
        // Use local storage for guest users
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [syncWishlist]);

  const clearWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      // If user is authenticated, clear on server too
      const token = localStorage.getItem('access_token');
      if (token) {
        for (const item of state.items) {
          await apiClient.removeFromWishlist(item.product_id);
        }
      }
      
      dispatch({ type: 'CLEAR_WISHLIST' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [state.items]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return state.items.some(item => item.product_id === productId);
  }, [state.items]);

  const getWishlistCount = useCallback((): number => {
    return state.items.length;
  }, [state.items]);

  const moveToCart = useCallback(async (productId: string) => {
    try {
      console.log('Moving product to cart:', productId);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Auto-sync wishlist when authentication state changes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !state.isSynced) {
      syncWishlist();
    }
  }, [state.isSynced, syncWishlist]);

  const value: WishlistContextType = {
    state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    syncWishlist,
    moveToCart,
    dispatch,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}