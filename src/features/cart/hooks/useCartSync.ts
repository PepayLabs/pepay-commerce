import { useEffect, useRef } from 'react';
import { userAuth } from '@/lib/userAuth';
import { useCart, useSyncCart } from './useCart';
import { useCartStore } from '../store/cartStore';

/**
 * Hook that handles cart synchronization when authentication state changes
 * - Syncs local cart to server when user logs in
 * - Fetches cart from server for authenticated users
 * - Maintains local cart for guests
 */
export const useCartSync = () => {
  const { refetch: refetchCart } = useCart();
  const { mutate: syncCart } = useSyncCart();
  const localItems = useCartStore((state) => state.items);
  const hasInitialized = useRef(false);
  const previousAuthState = useRef(userAuth.getAuthState());

  useEffect(() => {
    const checkAuthStateChange = () => {
      const currentAuthState = userAuth.getAuthState();
      
      // Check if user just logged in (was not authenticated, now is authenticated)
      if (!previousAuthState.current.isAuthenticated && currentAuthState.isAuthenticated) {
        // User just logged in
        console.log('User logged in, syncing cart...');
        
        // If there are local items, sync them to the server
        if (localItems.length > 0) {
          syncCart();
        } else {
          // Just fetch the user's cart from server
          refetchCart();
        }
      }
      
      // Update previous auth state
      previousAuthState.current = currentAuthState;
    };

    // Check auth state on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      checkAuthStateChange();
    }

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pepay-auth-token' || e.key === 'pepay-wallet-auth') {
        checkAuthStateChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom auth state changes
    const interval = setInterval(checkAuthStateChange, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [localItems.length, refetchCart, syncCart]);
};

/**
 * Hook to initialize cart on app load
 * Should be used at the root of the application
 */
export const useInitializeCart = () => {
  const { isAuthenticated } = userAuth.getAuthState();
  const setCart = useCartStore((state) => state.setCart);
  
  // Use the cart hook to fetch from API if authenticated
  const { data: serverCart } = useCart();
  
  useEffect(() => {
    if (isAuthenticated && serverCart) {
      // Set server cart data to local store
      setCart(serverCart);
    }
    // For unauthenticated users, the cart will be loaded from localStorage automatically
  }, [isAuthenticated, serverCart, setCart]);
  
  // Use the sync hook to handle auth state changes
  useCartSync();
};