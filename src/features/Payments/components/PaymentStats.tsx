import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, CreditCard, Heart, Repeat, Package, Calendar } from 'lucide-react';

interface PaymentTotals {
  donations: {
    count: number;
    total_amount: number;
  };
  subscriptions: {
    count: number;
    total_amount: number;
  };
  content: {
    count: number;
    total_amount: number;
  };
  packages: {
    count: number;
    total_amount: number;
  };
  overall: {
    count: number;
    total_amount: number;
  };
}

interface PaymentStatsProps {
  totals: PaymentTotals;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({ totals }) => {
  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined
    if (!amount || isNaN(amount)) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    // Handle NaN, null, undefined
    if (!num || isNaN(num)) return '0';
    
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Safe access to totals with fallbacks
  const safeTotals = {
    donations: totals?.donations || { count: 0, total_amount: 0 },
    subscriptions: totals?.subscriptions || { count: 0, total_amount: 0 },
    content: totals?.content || { count: 0, total_amount: 0 },
    packages: totals?.packages || { count: 0, total_amount: 0 },
    overall: totals?.overall || { count: 0, total_amount: 0 }
  };

  // Calculate averages
  const avgDonation = safeTotals.donations.count > 0 
    ? safeTotals.donations.total_amount / safeTotals.donations.count 
    : 0;
  const avgSubscription = safeTotals.subscriptions.count > 0 
    ? safeTotals.subscriptions.total_amount / safeTotals.subscriptions.count 
    : 0;
  const avgContent = safeTotals.content.count > 0 
    ? safeTotals.content.total_amount / safeTotals.content.count 
    : 0;
  const avgPackage = safeTotals.packages.count > 0 
    ? safeTotals.packages.total_amount / safeTotals.packages.count 
    : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(safeTotals.overall.total_amount),
      icon: <DollarSign className="h-5 w-5" />,
      subtext: `${formatNumber(safeTotals.overall.count)} transactions`,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      title: 'Donations',
      value: formatCurrency(safeTotals.donations.total_amount),
      icon: <Heart className="h-5 w-5" />,
      subtext: `${formatNumber(safeTotals.donations.count)} donations • Avg ${formatCurrency(avgDonation)}`,
      color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400'
    },
    {
      title: 'Subscriptions',
      value: formatCurrency(safeTotals.subscriptions.total_amount),
      icon: <Repeat className="h-5 w-5" />,
      subtext: `${formatNumber(safeTotals.subscriptions.count)} subscriptions • Avg ${formatCurrency(avgSubscription)}`,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
    },
    {
      title: 'Content Sales',
      value: formatCurrency(safeTotals.content.total_amount),
      icon: <CreditCard className="h-5 w-5" />,
      subtext: `${formatNumber(safeTotals.content.count)} purchases • Avg ${formatCurrency(avgContent)}`,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      title: 'Package Sales',
      value: formatCurrency(safeTotals.packages.total_amount),
      icon: <Package className="h-5 w-5" />,
      subtext: `${formatNumber(safeTotals.packages.count)} packages • Avg ${formatCurrency(avgPackage)}`,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <div className={`p-1 rounded-md ${stat.color}`}>
                  {stat.icon}
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {stat.subtext}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 