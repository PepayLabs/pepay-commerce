import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Calendar, CreditCard, Users, Globe, Lock } from 'lucide-react';

interface PaymentFiltersProps {
  filters: {
    type: string;
    timeRange: string;
    visibility: string;
  };
  onFilterChange: (key: string, value: string) => void;
  invoiceCount: number;
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFilterChange,
  invoiceCount
}) => {
  const typeOptions = [
    { value: 'all', label: 'All Types', icon: <CreditCard className="h-3 w-3" /> },
    { value: 'donation', label: 'Donations', icon: '💝' },
    { value: 'subscription', label: 'Subscriptions', icon: '🔄' },
    { value: 'content', label: 'Content Sales', icon: '📄' },
    { value: 'package', label: 'Package Sales', icon: '📦' }
  ];

  const timeRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const visibilityOptions = [
    { value: 'all', label: 'All Payments', icon: <Globe className="h-3 w-3" /> },
    { value: 'public', label: 'Public Only', icon: <Globe className="h-3 w-3" /> },
    { value: 'private', label: 'Private Only', icon: <Lock className="h-3 w-3" /> }
  ];

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.timeRange !== 'all', 
    filters.visibility !== 'all'
  ].filter(Boolean).length;

  return (
    <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filters.type} onValueChange={(value) => onFilterChange('type', value)}>
              <SelectTrigger className="w-full sm:w-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {typeof option.icon === 'string' ? (
                        <span>{option.icon}</span>
                      ) : (
                        option.icon
                      )}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.timeRange} onValueChange={(value) => onFilterChange('timeRange', value)}>
              <SelectTrigger className="w-full sm:w-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.visibility} onValueChange={(value) => onFilterChange('visibility', value)}>
              <SelectTrigger className="w-full sm:w-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90">
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 text-xs">
              {invoiceCount} result{invoiceCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 