// frontend/providers/CartProvider.tsx
'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  product_id?: string;
  product_name?: string;
  image_url?: string; 
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
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  // Public API methods
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  // Dispatch for advanced usage
  dispatch: React.Dispatch<CartAction>;
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((count, item) => count + item.quantity, 0),
        error: null,
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: filteredItems.reduce((count, item) => count + item.quantity, 0),
        error: null,
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items
        .map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter(item => item.quantity > 0);
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((count, item) => count + item.quantity, 0),
        error: null,
      };

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | null>(null);

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Generate unique cart item ID
  const generateCartItemId = useCallback((item: Omit<CartItem, 'id'>) => {
    const baseId = item.product_id || item.name.toLowerCase().replace(/\s+/g, '-');
    const variant = item.size || item.color ? `-${item.size || ''}-${item.color || ''}` : '';
    return `${baseId}${variant}-${Date.now()}`;
  }, []);

  // Public API methods
  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const cartItem: CartItem = {
        ...item,
        id: generateCartItemId(item),
      };
      
      dispatch({ type: 'ADD_ITEM', payload: cartItem });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [generateCartItemId]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const removeFromCart = useCallback((id: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const clearCart = useCallback(() => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'CLEAR_CART' });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const getCartTotal = useCallback((): number => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.items]);

  const getItemCount = useCallback((): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const value: CartContextType = {
    state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getItemCount,
    dispatch,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper hook for cart operations with toast notifications
export function useCartWithToast() {
  const cart = useCart();
  const { showSuccess, showError } = useToast(); // You'll need to implement useToast

  const addToCartWithToast = useCallback(async (item: Omit<CartItem, 'id'>) => {
    try {
      cart.addToCart(item);
      showSuccess(`${item.name} added to cart`);
    } catch (error) {
      showError(`Failed to add ${item.name} to cart`);
      throw error;
    }
  }, [cart, showSuccess, showError]);

  const updateQuantityWithToast = useCallback(async (id: string, quantity: number, itemName: string) => {
    try {
      cart.updateQuantity(id, quantity);
      showSuccess(`Updated ${itemName} quantity`);
    } catch (error) {
      showError(`Failed to update ${itemName} quantity`);
      throw error;
    }
  }, [cart, showSuccess, showError]);

  const removeFromCartWithToast = useCallback(async (id: string, itemName: string) => {
    try {
      cart.removeFromCart(id);
      showSuccess(`Removed ${itemName} from cart`);
    } catch (error) {
      showError(`Failed to remove ${itemName} from cart`);
      throw error;
    }
  }, [cart, showSuccess, showError]);

  return {
    ...cart,
    addToCart: addToCartWithToast,
    updateQuantity: updateQuantityWithToast,
    removeFromCart: removeFromCartWithToast,
  };
}

// Utility function to convert product data to cart item
export const productToCartItem = (product: any, quantity: number = 1): Omit<CartItem, 'id'> => {
  return {
    name: product.name,
    price: product.onSale ? product.salePrice! : product.price,
    quantity,
    image: product.images[0]?.image || '/images/placeholder-product.jpg',
    size: product.size,
    color: product.color,
    product_id: product.id,
  };
};

// Toast hook placeholder - implement based on your toast library
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