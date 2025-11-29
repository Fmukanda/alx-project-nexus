'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  variant_details?: {
    size?: string;
    color?: string;
  };
  max_quantity?: number;
  in_stock?: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SYNC_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getItemCount: () => number;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        itemCount: action.payload.reduce((sum, item) => sum + item.quantity, 0),
        total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => 
        item.product_id === action.payload.product_id && 
        item.variant_id === action.payload.variant_id
      );

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product_id === action.payload.product_id && item.variant_id === action.payload.variant_id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, id: Date.now().toString() }];
      }

      return {
        ...state,
        items: newItems,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        total: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        itemCount: 0,
        total: 0,
      };
    
    case 'SYNC_CART':
      return {
        ...state,
        items: action.payload,
        itemCount: action.payload.reduce((sum, item) => sum + item.quantity, 0),
        total: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    
    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          dispatch({ type: 'SET_CART', payload: cartData.items || [] });
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    };

    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      total: state.total,
      itemCount: state.itemCount,
    }));
  }, [state.items, state.total, state.itemCount]);

  // Sync cart with server when user is authenticated
  const syncCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const serverCart = await apiClient.getCart();
      dispatch({ type: 'SYNC_CART', payload: serverCart.items });
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // If user is authenticated, sync with server
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.addToCart({
          product: item.product_id,
          variant: item.variant_id,
          quantity: item.quantity,
        });
        await syncCart();
      } else {
        // Use local storage for guest users
        dispatch({ type: 'ADD_ITEM', payload: { ...item, id: Date.now().toString() } });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.updateCartItem(itemId, quantity);
        await syncCart();
      } else {
        dispatch({ type: 'UPDATE_ITEM', payload: { itemId, quantity } });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.removeCartItem(itemId);
        await syncCart();
      } else {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.clearCart();
      }
      dispatch({ type: 'CLEAR_CART' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    ...state,
    dispatch,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getItemCount,
    syncCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}