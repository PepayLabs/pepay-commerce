import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  RefreshCw, 
  Filter,
  DollarSign,
  CreditCard,
  Eye,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { PaymentCard } from '../components/PaymentCard';
import { PaymentStats } from '../components/PaymentStats';
import { PaymentFilters } from '../components/PaymentFilters';

export const PaymentsPage: React.FC = () => {
  const {
    data,
    loading,
    error,
    filters,
    setFilters,
    updateVisibility,
    updateResponse,
    refresh
  } = usePayments();

  const { toast } = useToast();

  const handleRefresh = () => {
    refresh();
    toast({
      title: "Refreshed successfully! 🔄",
      description: "Payment data has been updated.",
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 py-6 ml-4 mr-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600 dark:text-gray-400">Loading payment data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="px-4 py-6 ml-4 mr-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl max-w-md">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Failed to load payments
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                  {error}
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 py-6 ml-4 mr-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                💰 Payment Analytics
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Track and manage your revenue across all platforms
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 sm:ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shrink-0"
              >
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {data && (
          <>
            {/* Stats Overview */}
            <PaymentStats totals={data.totals} />

            {/* Filters */}
            <PaymentFilters 
              filters={filters} 
              onFilterChange={handleFilterChange}
              invoiceCount={data.pagination.filtered_count}
            />

            {/* Payments List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Payments
                </h2>
                <Badge variant="secondary" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80">
                  {data.pagination.filtered_count} payment{data.pagination.filtered_count !== 1 ? 's' : ''}
                </Badge>
              </div>

              {data.invoices.length === 0 ? (
                <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No payments found
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                        {filters.type 
                          ? `No ${filters.type} payments found. Try adjusting your filters.`
                          : 'Your payments will appear here once supporters start contributing.'
                        }
                      </p>
                      {filters.type && (
                        <Button 
                          onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                          variant="outline"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {data.invoices.map((invoice) => (
                    <PaymentCard
                      key={invoice.invoice_id}
                      invoice={invoice}
                      onUpdateVisibility={updateVisibility}
                      onUpdateResponse={updateResponse}
                    />
                  ))}

                  {/* Pagination Info */}
                  {data.pagination.has_more && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Showing {data.invoices.length} of {data.pagination.total_count} payments
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        💡 Pagination coming soon for easier browsing
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage; 