'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  product_id?: string; // Added for consistency
  in_stock?: boolean;
  added_at?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
}

type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_WISHLIST'; payload: WishlistItem[] };

interface WishlistContextType {
  state: WishlistState;
  // Public API methods
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  // Dispatch for advanced usage
  dispatch: React.Dispatch<WishlistAction>;
}

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload,
        error: null,
      };
    
    case 'ADD_ITEM':
      if (state.items.find(item => item.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        error: null,
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        error: null,
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        error: null,
      };

    default:
      return state;
  }
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
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
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
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

  // Public API methods
  const addToWishlist = useCallback((product: any) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });

      const wishlistItem: WishlistItem = {
        id: product.id,
        name: product.name,
        price: product.onSale ? product.salePrice! : product.price,
        image: product.images[0]?.image || '/images/placeholder-product.jpg',
        slug: product.slug,
        product_id: product.id,
        in_stock: product.isActive,
        added_at: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_ITEM', payload: wishlistItem });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const clearWishlist = useCallback(() => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'CLEAR_WISHLIST' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const isInWishlist = useCallback((productId: string): boolean => {
    return state.items.some(item => item.id === productId);
  }, [state.items]);

  const getWishlistCount = useCallback((): number => {
    return state.items.length;
  }, [state.items]);

  const value: WishlistContextType = {
    state,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    dispatch,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Helper hook for wishlist operations with toast notifications
export function useWishlistWithToast() {
  const wishlist = useWishlist();
  const { showSuccess, showError } = useToast();

  const addToWishlistWithToast = useCallback(async (product: any) => {
    try {
      wishlist.addToWishlist(product);
      showSuccess(`${product.name} added to wishlist`);
    } catch (error) {
      showError(`Failed to add ${product.name} to wishlist`);
      throw error;
    }
  }, [wishlist, showSuccess, showError]);

  const removeFromWishlistWithToast = useCallback(async (productId: string, productName: string) => {
    try {
      wishlist.removeFromWishlist(productId);
      showSuccess(`${productName} removed from wishlist`);
    } catch (error) {
      showError(`Failed to remove ${productName} from wishlist`);
      throw error;
    }
  }, [wishlist, showSuccess, showError]);

  return {
    ...wishlist,
    addToWishlist: addToWishlistWithToast,
    removeFromWishlist: removeFromWishlistWithToast,
  };
}

// Utility function to convert product data to wishlist item
export const productToWishlistItem = (product: any): WishlistItem => {
  return {
    id: product.id,
    name: product.name,
    price: product.onSale ? product.salePrice! : product.price,
    image: product.images[0]?.image || '/images/placeholder-product.jpg',
    slug: product.slug,
    product_id: product.id,
    in_stock: product.isActive,
    added_at: new Date().toISOString(),
  };
};

// Toast hook implementation
function useToast() {
  const showSuccess = useCallback((message: string) => {
    console.log(`Success: ${message}`);
    // Replace with your toast implementation (react-hot-toast, sonner, etc.)
    // toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    console.error(`Error: ${message}`);
    // Replace with your toast implementation
    // toast.error(message);
  }, []);

  return { showSuccess, showError };
}