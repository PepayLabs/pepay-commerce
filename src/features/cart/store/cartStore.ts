import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Cart } from '../types/cart.types';

interface CartStore {
  // State
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  isLoading: boolean;
  
  // Actions
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getItemCount: () => number;
  getTotalQuantity: () => number;
  getSubtotal: () => number;
  findItem: (productId: string) => CartItem | undefined;
}

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    itemCount: items.length,
    totalQuantity,
    subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
  };
};

// Cart store with persistence for unauthenticated users
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      itemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      isLoading: false,
      
      // Set entire cart (used when fetching from API)
      setCart: (cart: Cart) => {
        set({
          items: cart.items,
          itemCount: cart.itemCount,
          totalQuantity: cart.totalQuantity,
          subtotal: cart.subtotal,
        });
      },
      
      // Add item to cart
      addItem: (item: CartItem) => {
        set((state) => {
          const existingItem = state.items.find(i => i.productId === item.productId);
          
          if (existingItem) {
            // Update quantity if item already exists
            const updatedItems = state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.price }
                : i
            );
            const totals = calculateCartTotals(updatedItems);
            
            return {
              items: updatedItems,
              ...totals,
            };
          } else {
            // Add new item
            const updatedItems = [...state.items, item];
            const totals = calculateCartTotals(updatedItems);
            
            return {
              items: updatedItems,
              ...totals,
            };
          }
        });
      },
      
      // Update item in cart
      updateItem: (itemId: string, updates: Partial<CartItem>) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.id === itemId
              ? { 
                  ...item, 
                  ...updates,
                  subtotal: updates.quantity ? updates.quantity * item.price : item.subtotal
                }
              : item
          );
          const totals = calculateCartTotals(updatedItems);
          
          return {
            items: updatedItems,
            ...totals,
          };
        });
      },
      
      // Remove item from cart
      removeItem: (itemId: string) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.id !== itemId);
          const totals = calculateCartTotals(updatedItems);
          
          return {
            items: updatedItems,
            ...totals,
          };
        });
      },
      
      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
          totalQuantity: 0,
          subtotal: 0,
        });
      },
      
      // Recalculate totals
      calculateTotals: () => {
        set((state) => {
          const totals = calculateCartTotals(state.items);
          return totals;
        });
      },
      
      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      // Computed getters
      getItemCount: () => get().itemCount,
      getTotalQuantity: () => get().totalQuantity,
      getSubtotal: () => get().subtotal,
      findItem: (productId: string) => get().items.find(item => item.productId === productId),
    }),
    {
      name: 'pepay-cart-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist cart data, not loading state
        items: state.items,
        itemCount: state.itemCount,
        totalQuantity: state.totalQuantity,
        subtotal: state.subtotal,
      }),
      // Set cache expiry to 1 month (in milliseconds)
      version: 1,
    }
  )
);

// Helper hook to check if cart has items
export const useCartHasItems = () => {
  return useCartStore((state) => state.itemCount > 0);
};

// Helper hook to get cart item count
export const useCartItemCount = () => {
  return useCartStore((state) => state.totalQuantity);
};