import { axiosInstance } from '@/lib/axios';
import { auth } from '@/lib/auth';
import {
  PaymentsResponse,
  PaymentFilters,
  UpdateVisibilityRequest,
  UpdateResponseRequest,
  Invoice
} from '../types/payments.types';

// Create axios instance with base URL
const api = axiosInstance;

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = auth.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const paymentsApi = {
  /**
   * Get all paid invoices for the authenticated account
   */
  async getPaidInvoices(filters: PaymentFilters = {}): Promise<PaymentsResponse> {
    const {
      type,
      limit = 50,
      offset = 0,
      include_retry_info = false,
      only_complete_data = false
    } = filters;

    try {
      const response = await api.get('/api/accounts/paid-invoices', {
        params: {
          type,
          limit,
          offset,
          include_retry_info,
          only_complete_data
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching paid invoices:', error);
      throw error;
    }
  },

  /**
   * Update visibility for donations and subscriptions
   * Uses transaction_id as the purchaseId (donation_id/subscription_id)
   */
  async updateVisibility(
    transactionId: string, // This should be transaction_id (donation_id/subscription_id)
    data: UpdateVisibilityRequest
  ): Promise<{ message: string; purchase: Partial<Invoice> }> {
    try {
      const response = await api.put(
        `/api/accounts/purchase/${transactionId}/visibility`,
        data
      );

      return response.data;
    } catch (error) {
      console.error('Error updating visibility:', error);
      throw error;
    }
  },

  /**
   * Update response message for donations and subscriptions  
   * Uses transaction_id as the purchaseId (donation_id/subscription_id)
   */
  async updateResponse(
    transactionId: string, // This should be transaction_id (donation_id/subscription_id)
    data: UpdateResponseRequest
  ): Promise<{ message: string; purchase: Partial<Invoice> }> {
    try {
      const response = await api.put(
        `/api/accounts/purchase/${transactionId}/response`,
        data
      );

      return response.data;
    } catch (error) {
      console.error('Error updating response:', error);
      throw error;
    }
  }
}; 