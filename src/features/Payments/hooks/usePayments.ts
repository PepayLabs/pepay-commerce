import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '../api/paymentsApi';
import { PaymentsResponse, PaymentFilters, Invoice } from '../types/payments.types';

export function usePayments(initialFilters: Partial<PaymentFilters> = {}) {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    type: 'all',
    timeRange: 'all', 
    visibility: 'all',
    limit: 50,
    offset: 0,
    include_retry_info: false,
    only_complete_data: false,
    ...initialFilters
  });

  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert frontend filters to API filters
      const apiFilters = {
        type: filters.type === 'all' ? undefined : filters.type as 'donation' | 'subscription' | 'content' | 'package',
        limit: filters.limit,
        offset: filters.offset,
        include_retry_info: filters.include_retry_info,
        only_complete_data: filters.only_complete_data
      };

      const response = await paymentsApi.getPaidInvoices(apiFilters);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payments';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  const updateVisibility = useCallback(async (transactionId: string, isPublic: boolean) => {
    try {
      // Use transaction_id for API call (this is the donation_id/subscription_id)
      await paymentsApi.updateVisibility(transactionId, { is_public: isPublic });
      
      // Update local state using transaction_id to match
      setData(prev => prev ? {
        ...prev,
        invoices: prev.invoices.map(invoice => 
          invoice.transaction_id === transactionId 
            ? { ...invoice, is_public: isPublic }
            : invoice
        )
      } : null);
      
    } catch (error) {
      console.error('Error updating visibility:', error);
      throw error;
    }
  }, []);

  const updateResponse = useCallback(async (transactionId: string, responseMessage: string) => {
    try {
      // Use transaction_id for API call (this is the donation_id/subscription_id)
      await paymentsApi.updateResponse(transactionId, { response_message: responseMessage });
      
      // Update local state using transaction_id to match
      setData(prev => prev ? {
        ...prev,
        invoices: prev.invoices.map(invoice => 
          invoice.transaction_id === transactionId 
            ? { ...invoice, response_message: responseMessage }
            : invoice
        )
      } : null);
      
    } catch (error) {
      console.error('Error updating response:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    fetchPayments,
    refresh,
    updateVisibility,
    updateResponse
  };
} 