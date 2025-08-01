import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import { useCartStore } from '../store/cartStore';
import { AddToCartRequest, UpdateCartItemRequest, CartItem } from '../types/cart.types';
import { userAuth } from '@/lib/userAuth';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'detail'] as const,
};

// Hook to fetch cart from API
export const useCart = () => {
  const setCart = useCartStore((state) => state.setCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const { isAuthenticated } = userAuth.getAuthState();

  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: async () => {
      // Only fetch from API if authenticated
      if (!isAuthenticated) {
        return null; // Use local storage cart for guests
      }
      
      try {
        const response = await cartApi.getCart();
        if (response.success) {
          setCart(response.data);
          return response.data;
        }
        return null;
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Clear cart if unauthorized
          clearCart();
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook to add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = userAuth.getAuthState();

  return useMutation({
    mutationFn: async (data: AddToCartRequest) => {
      if (!isAuthenticated) {
        // For guests, add to local storage only
        const localItem: CartItem = {
          id: uuidv4(),
          productId: data.productId,
          retailer: data.retailer,
          title: data.title || 'Product',
          imageUrl: data.imageUrl,
          price: data.price,
          quantity: data.quantity,
          subtotal: data.price * data.quantity,
          stars: data.stars,
          numReviews: data.numReviews,
          brand: data.brand,
          categories: data.categories,
          source: data.source,
          productUrl: data.productUrl,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        addItem(localItem);
        return { success: true, data: localItem };
      }
      
      // For authenticated users, call API
      const response = await cartApi.addItem(data);
      return response;
    },
    onSuccess: (response) => {
      if (isAuthenticated) {
        // Refetch cart from API to ensure sync
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      }
      
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to add item to cart';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to update cart item
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateItem = useCartStore((state) => state.updateItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const { isAuthenticated } = userAuth.getAuthState();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (!isAuthenticated) {
        // For guests, update local storage only
        if (quantity === 0) {
          removeItem(itemId);
        } else {
          updateItem(itemId, { quantity });
        }
        return { success: true };
      }
      
      // For authenticated users, call API
      if (quantity === 0) {
        return await cartApi.removeItem(itemId);
      }
      return await cartApi.updateItem(itemId, { quantity });
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to update cart';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const removeItem = useCartStore((state) => state.removeItem);
  const { isAuthenticated } = userAuth.getAuthState();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!isAuthenticated) {
        // For guests, remove from local storage only
        removeItem(itemId);
        return { success: true };
      }
      
      // For authenticated users, call API
      return await cartApi.removeItem(itemId);
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      }
      
      toast({
        title: 'Removed from cart',
        description: 'Item has been removed from your cart',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to remove item';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const clearCart = useCartStore((state) => state.clearCart);
  const { isAuthenticated } = userAuth.getAuthState();

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        // For guests, clear local storage only
        clearCart();
        return { success: true };
      }
      
      // For authenticated users, call API
      return await cartApi.clearCart();
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      } else {
        clearCart();
      }
      
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error?.message || 'Failed to clear cart';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to sync cart when user logs in
export const useSyncCart = () => {
  const queryClient = useQueryClient();
  const localCart = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Get local cart items
      if (localCart.length === 0) {
        return { success: true, message: 'No local items to sync' };
      }

      // Add each local item to the server cart
      const promises = localCart.map((item) =>
        cartApi.addItem({
          productId: item.productId,
          retailer: item.retailer,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
          source: item.source,
          productUrl: item.productUrl,
          title: item.title,
          stars: item.stars,
          numReviews: item.numReviews,
          brand: item.brand,
          categories: item.categories,
        })
      );

      try {
        await Promise.all(promises);
        
        // Clear local cart after successful sync
        clearCart();
        
        return { success: true, message: 'Cart synced successfully' };
      } catch (error) {
        console.error('Failed to sync some cart items:', error);
        return { success: false, message: 'Some items could not be synced' };
      }
    },
    onSuccess: (result) => {
      // Refetch cart from API
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      
      if (result.success && localCart.length > 0) {
        toast({
          title: 'Cart synced',
          description: 'Your cart items have been saved to your account',
          variant: 'default',
        });
      }
    },
  });
};