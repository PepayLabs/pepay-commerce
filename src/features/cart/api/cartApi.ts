import { axiosInstance as axios } from '@/lib/axios';
import { 
  CartApiResponse, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartItemResponse,
  CartClearResponse,
  CartErrorResponse 
} from '../types/cart.types';

export const cartApi = {
  // Get current user's cart
  getCart: async (): Promise<CartApiResponse> => {
    const response = await axios.get('/api/commerce/cart');
    return response.data;
  },

  // Add item to cart
  addItem: async (data: AddToCartRequest): Promise<CartItemResponse> => {
    const response = await axios.post('/api/commerce/cart', data);
    return response.data;
  },

  // Update cart item quantity
  updateItem: async (itemId: string, data: UpdateCartItemRequest): Promise<CartItemResponse> => {
    const response = await axios.put(`/api/commerce/cart/${itemId}`, data);
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId: string): Promise<{ success: boolean; data: { success: boolean; message: string } }> => {
    const response = await axios.delete(`/api/commerce/cart/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<CartClearResponse> => {
    const response = await axios.delete('/api/commerce/cart');
    return response.data;
  },
};