import React, { useState, useEffect } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, CreditCard, Heart, Sparkles, Users, DollarSign, Clock, TrendingUp, Gift } from 'lucide-react'
import { paymentSettingsApi, PaymentSettings } from '../../api/paymentSettingsApi'
import { cn } from '@/lib/utils'

// Match the exact image mapping from ProfileSupport.tsx
// 

const supportImages = [
  { id: 1, path: '/images/pizza1.png', name: 'Pizza', description: 'Buy me a pizza slice' },
  { id: 2, path: '/images/pills.png', name: 'Pills', description: 'Buy me some pills' },
  { id: 3, path: '/images/cash.png', name: 'Cash', description: 'Send me some cash' },
  { id: 4, path: '/images/chips.png', name: 'Chips', description: 'Buy me some chips' },
  { id: 5, path: '/images/blunts.png', name: 'Blunts', description: 'Buy me some blunts' },
  { id: 6, path: '/images/candle.png', name: 'Candle', description: 'Buy me a candle' },
  { id: 7, path: '/images/hat.png', name: 'Hat', description: 'Buy me a hat' },
]

export default function SupportStep() {
  const { state, actions } = useWizard()
  const { account } = state.formData
  
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwitchingModel, setIsSwitchingModel] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add state for subscription pricing
  const [subscriptionPricing, setSubscriptionPricing] = useState({
    monthly: paymentSettings?.subscription_monthly_price || 10,
    quarterly: paymentSettings?.subscription_quarterly_price || 27,
    yearly: paymentSettings?.subscription_yearly_price || 80
  })

  // Load payment settings on mount
  useEffect(() => {
    loadPaymentSettings()
  }, [])

  const loadPaymentSettings = async () => {
    try {
      setIsLoading(true)
      const settings = await paymentSettingsApi.getPaymentSettings()
      setPaymentSettings(settings)
      
      // Update subscription pricing state from loaded settings
      setSubscriptionPricing({
        monthly: settings.subscription_settings?.monthly_price || 10,
        quarterly: settings.subscription_settings?.quarterly_price || 27,
        yearly: settings.subscription_settings?.yearly_price || 80
      })
      
      // Update wizard state with COMPLETE current settings
      actions.updateAccountData({
        // Include payment model
        payment_model: settings.payment_model,
        
        // Support settings
        support_title: settings.support_settings.support_title,
        support_message: settings.support_settings.support_message,
        
        // Legacy fields for backwards compatibility
        custom_donation_amount_1: settings.donation_settings.amount_1,
        custom_donation_amount_2: settings.donation_settings.amount_2,
        custom_donation_amount_3: settings.donation_settings.amount_3,
        
        // Subscription pricing fields (correct field names for API)
        subscription_monthly_price: settings.subscription_settings?.monthly_price || 10,
        subscription_quarterly_price: settings.subscription_settings?.quarterly_price || 27,
        subscription_yearly_price: settings.subscription_settings?.yearly_price || 80,
        
        // New payment model structures (for internal use)
        donation_amounts: {
          amount_1: settings.donation_settings.amount_1,
          amount_2: settings.donation_settings.amount_2,
          amount_3: settings.donation_settings.amount_3
        },
        subscription_pricing: {
          monthly_price: settings.subscription_settings?.monthly_price || 10,
          quarterly_price: settings.subscription_settings?.quarterly_price || 27,
          yearly_price: settings.subscription_settings?.yearly_price || 80
        }
      })
    } catch (error) {
      console.error('Failed to load payment settings:', error)
      setError('Failed to load payment settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentModelSwitch = async (newModel: 'donations' | 'subscriptions') => {
    if (!paymentSettings || paymentSettings.payment_model === newModel) return

    try {
      setIsSwitchingModel(true)
      setError(null)
      
      const response = await paymentSettingsApi.updatePaymentModel(newModel)
      
      // ✅ Fix: Create complete payment settings object with payment_model
      const updatedPaymentSettings: PaymentSettings = {
        payment_model: newModel, // ← This was missing!
        donation_settings: response.payment_settings.donation_settings,
        subscription_settings: response.payment_settings.subscription_settings,
        support_settings: response.payment_settings.support_settings,
        last_updated: response.updated_at || new Date().toISOString()
      }
      
      setPaymentSettings(updatedPaymentSettings)
      
      // Update wizard state with COMPLETE new settings
      actions.updateAccountData({
        payment_model: newModel,
        support_title: response.payment_settings.support_settings.support_title,
        support_message: response.payment_settings.support_settings.support_message,
        custom_donation_amount_1: response.payment_settings.donation_settings.amount_1,
        custom_donation_amount_2: response.payment_settings.donation_settings.amount_2,
        custom_donation_amount_3: response.payment_settings.donation_settings.amount_3,
        donation_amounts: {
          amount_1: response.payment_settings.donation_settings.amount_1,
          amount_2: response.payment_settings.donation_settings.amount_2,
          amount_3: response.payment_settings.donation_settings.amount_3
        },
        subscription_pricing: {
          monthly_price: response.payment_settings.subscription_settings.monthly_price,
          quarterly_price: response.payment_settings.subscription_settings.quarterly_price,
          yearly_price: response.payment_settings.subscription_settings.yearly_price
        }
      })

      console.log('✅ Payment model switched successfully:', response.message)
      console.log('🔧 Updated payment settings:', updatedPaymentSettings) // Add this for debugging
    } catch (error) {
      console.error('Failed to switch payment model:', error)
      setError('Failed to update payment model')
    } finally {
      setIsSwitchingModel(false)
    }
  }

  const handleInputChange = (field: keyof typeof account) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    actions.updateAccountData({ [field]: value })
  }

  const handleDonationAmountChange = (field: keyof typeof account) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    const numericValue = inputValue === '' ? undefined : parseFloat(inputValue)
    actions.updateAccountData({ [field]: numericValue })
  }

  const currentImageIndex = supportImages.findIndex(img => img.id === (account.support_image || 1))
  const currentImage = supportImages[currentImageIndex] || supportImages[0]

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : supportImages.length - 1
    } else {
      newIndex = currentImageIndex < supportImages.length - 1 ? currentImageIndex + 1 : 0
    }
    const newImageId = supportImages[newIndex].id
    actions.updateAccountData({ support_image: newImageId })
  }

  // Debug logging to see what we're getting
  console.log('🔍 Account type debug:', {
    account_type: account.account_type,
    isNPO: account.account_type === 'npo',
    isInfluencer: account.account_type === 'influencer' || account.account_type === 'creator',
    fullAccount: account
  })

  // Calculate optimal pricing with discounts
  const calculateOptimalPricing = (monthlyPrice: number) => {
    const quarterly = Math.round(monthlyPrice * 3 * 0.9) // 10% discount
    const yearly = Math.round(monthlyPrice * 12 * 0.8)   // 20% discount
    return { quarterly, yearly }
  }

  // Handle pricing changes
  const handleSubscriptionPriceChange = (tier: 'monthly' | 'quarterly' | 'yearly') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(event.target.value) || 0
    
    if (tier === 'monthly') {
      // Auto-calculate quarterly and yearly when monthly changes
      const optimal = calculateOptimalPricing(value)
      const newPricing = {
        monthly: value,
        quarterly: optimal.quarterly,
        yearly: optimal.yearly
      }
      setSubscriptionPricing(newPricing)
      
      // Update wizard state
      actions.updateAccountData({
        subscription_monthly_price: value,
        subscription_quarterly_price: optimal.quarterly,
        subscription_yearly_price: optimal.yearly
      })
    } else {
      // Manual override for quarterly/yearly
      const newPricing = { ...subscriptionPricing, [tier]: value }
      setSubscriptionPricing(newPricing)
      
      actions.updateAccountData({
        [`subscription_${tier}_price`]: value
      })
    }
  }

  // Calculate discount percentages
  const getDiscountPercentage = (tier: 'quarterly' | 'yearly') => {
    if (tier === 'quarterly') {
      const monthlyEquivalent = subscriptionPricing.quarterly / 3
      return Math.round((1 - monthlyEquivalent / subscriptionPricing.monthly) * 100)
    } else {
      const monthlyEquivalent = subscriptionPricing.yearly / 12
      return Math.round((1 - monthlyEquivalent / subscriptionPricing.monthly) * 100)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading payment settings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Settings</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
              <Button onClick={loadPaymentSettings} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentModel = paymentSettings?.payment_model || 'donations'
  const isNPO = account.account_type === 'npo'
  const isInfluencer = account.account_type === 'influencer' || account.account_type === 'creator'

  // Dynamic language based on account type
  const getLanguage = () => {
    if (isNPO) {
      return {
        donationModel: {
          title: 'Donations',
          description: 'One-time charitable donations',
          subtitle: 'Perfect for charitable giving',
          icon: '❤️'
        },
        subscriptionModel: {
          title: 'Monthly Supporters',
          description: 'Recurring monthly donations',
          subtitle: 'Sustainable recurring support',
          icon: '🤝'
        },
        pricingSection: {
          donation: {
            title: 'Donation Amounts',
            description: 'Set suggested amounts donors can choose from',
            note: 'Donors of any amount above $1 will receive updates and acknowledgments'
          },
          subscription: {
            title: 'Monthly Support Tiers',
            description: 'Recurring donation amounts (automatically optimized)',
            note: 'Monthly supporters will receive exclusive updates and impact reports'
          }
        }
      }
    } else {
      // Influencer/Creator language
      return {
        donationModel: {
          title: 'One-time Support',
          description: 'Fans can show support with tips',
          subtitle: 'Perfect for tip-based support',
          icon: '🎁'
        },
        subscriptionModel: {
          title: 'Subscriptions',
          description: 'Recurring monthly subscriptions',
          subtitle: 'Predictable income stream',
          icon: '🚀'
        },
        pricingSection: {
          donation: {
            title: 'Support Amounts',
            description: 'Set amounts supporters can choose from',
            note: 'Supporters of any amount above $1 will be able to view all your content (Pay what you can model)'
          },
          subscription: {
            title: 'Subscription Pricing',
            description: 'Monthly subscription tiers (automatically optimized)',
            note: 'Monthly subscribers may view all your content or gift other users access to your content'
          }
        }
      }
    }
  }

  const language = getLanguage()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isNPO ? 'Donation & Support Settings' : 'Payment & Support Settings'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {isNPO 
            ? 'Choose how donors can support your nonprofit mission'
            : 'Choose how your supporters can show appreciation for your work'
          }
        </p>
      </div>

      {/* Payment Model Selection */}
      <Card className="border-2 border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Sparkles className="w-5 h-5" />
            {isNPO ? 'Donation Model' : 'Payment Model'}
          </CardTitle>
          <CardDescription>
            {isNPO 
              ? 'Choose between one-time donations or recurring monthly support'
              : 'Choose between one-time support or recurring subscriptions'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donations/One-time Support Option */}
            <div
              className={cn(
                "relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200",
                currentModel === 'donations'
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg scale-105"
                  : "border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-md"
              )}
              onClick={() => handlePaymentModelSwitch('donations')}
            >
              {currentModel === 'donations' && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                  Active
                </Badge>
              )}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl">
                  {language.donationModel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {language.donationModel.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language.donationModel.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Gift className="w-4 h-4" />
                  {language.donationModel.subtitle}
                </div>
              </div>
            </div>

            {/* Subscriptions/Monthly Supporters Option */}
            <div
              className={cn(
                "relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200",
                currentModel === 'subscriptions'
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 shadow-lg scale-105"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md"
              )}
              onClick={() => handlePaymentModelSwitch('subscriptions')}
            >
              {currentModel === 'subscriptions' && (
                <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white">
                  Active
                </Badge>
              )}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
                  {language.subscriptionModel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {language.subscriptionModel.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language.subscriptionModel.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <TrendingUp className="w-4 h-4" />
                  {language.subscriptionModel.subtitle}
                </div>
              </div>
            </div>
          </div>

          {isSwitchingModel && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Switching payment model...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Message Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            {isNPO ? 'Payment Page Content' : 'Support Page Content'}
          </CardTitle>
          <CardDescription>
            {isNPO 
              ? 'Customize what donors will see on your payment page'
              : 'Customize what supporters will see on your support page'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="support_title" className="text-gray-800 dark:text-gray-200 font-medium">
              {isNPO ? 'Donation Title' : 'Support Title'}
            </Label>
            <Input
              id="support_title"
              value={account.support_title || ''}
              onChange={handleInputChange('support_title')}
              placeholder={
                isNPO 
                  ? (currentModel === 'donations' ? 'Support Our Mission 🤲' : 'Join Our Monthly Supporters 🤝')
                  : (currentModel === 'donations' ? 'Grab Me A Slice 🍕' : 'Join My Community 🚀')
              }
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="support_message" className="text-gray-800 dark:text-gray-200 font-medium">
              {isNPO ? 'Donation Message' : 'Support Message'}
            </Label>
            <Textarea
              id="support_message"
              value={account.support_message || ''}
              onChange={handleInputChange('support_message')}
              placeholder={
                isNPO
                  ? (currentModel === 'donations' 
                      ? 'Help us continue our mission with your generous donation'
                      : 'Become a monthly supporter and help sustain our mission long-term')
                  : (currentModel === 'donations' 
                      ? 'Help me continue creating content with your support'
                      : 'Subscribe to get exclusive access to my content and join our community')
              }
              rows={4}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Support Image Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            Support Image
          </CardTitle>
          <CardDescription>
            Choose an image that represents your support style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateImage('prev')}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src={currentImage.path}
                  alt={currentImage.name}
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    console.error('Image failed to load:', currentImage.path)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{currentImage.name}</p>
                <p className="text-gray-600 dark:text-gray-400">{currentImage.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {currentImageIndex + 1} of {supportImages.length}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateImage('next')}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Section - Dynamic based on payment model */}
      {currentModel === 'donations' ? (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <DollarSign className="w-5 h-5" />
              {language.pricingSection.donation.title}
            </CardTitle>
            <CardDescription>
              {language.pricingSection.donation.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-3">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Amount {num}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={account[`custom_donation_amount_${num}` as keyof typeof account] || ''}
                      onChange={handleDonationAmountChange(`custom_donation_amount_${num}` as keyof typeof account)}
                      className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 pl-10 text-lg font-medium focus:border-green-500 focus:ring-green-500"
                      placeholder={num === 1 ? '5.00' : num === 2 ? '10.00' : '25.00'}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {language.pricingSection.donation.note}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <CreditCard className="w-5 h-5" />
              Subscription Pricing
            </CardTitle>
            <CardDescription>
              Set your monthly price and we'll optimize quarterly and yearly pricing with built-in discounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Price Input */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Monthly Subscription Price
              </Label>
              <div className="relative w-full max-w-48">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">$</span>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={subscriptionPricing.monthly}
                  onChange={handleSubscriptionPriceChange('monthly')}
                  className="pl-8 pr-16 h-12 text-lg font-semibold focus:border-purple-500 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">/month</span>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Monthly */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${subscriptionPricing.monthly}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span>
                </div>
              </div>

              {/* Quarterly */}
              <div className="relative p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                {getDiscountPercentage('quarterly') > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1">
                    {getDiscountPercentage('quarterly')}% OFF
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Quarterly</span>
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                  ${subscriptionPricing.quarterly}
                  <span className="text-sm font-normal text-purple-600 dark:text-purple-400">/3mo</span>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  ${(subscriptionPricing.quarterly / 3).toFixed(2)}/month
                </div>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={subscriptionPricing.quarterly}
                  onChange={handleSubscriptionPriceChange('quarterly')}
                  className="mt-2 h-8 text-sm bg-white/80 dark:bg-gray-800/80 border-purple-300 dark:border-purple-600"
                />
              </div>

              {/* Yearly */}
              <div className="relative p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {getDiscountPercentage('yearly') > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1">
                    {getDiscountPercentage('yearly')}% OFF
                  </Badge>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Yearly</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                  ${subscriptionPricing.yearly}
                  <span className="text-sm font-normal text-indigo-600 dark:text-indigo-400">/year</span>
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                  ${(subscriptionPricing.yearly / 12).toFixed(2)}/month
                </div>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={subscriptionPricing.yearly}
                  onChange={handleSubscriptionPriceChange('yearly')}
                  className="mt-2 h-8 text-sm bg-white/80 dark:bg-gray-800/80 border-indigo-300 dark:border-indigo-600"
                />
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-purple-700 dark:text-purple-300 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {language.pricingSection.subscription.note}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}