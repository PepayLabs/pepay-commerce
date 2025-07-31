import { axiosInstance } from '@/lib/axios'

export interface PaymentSettings {
  payment_model: 'donations' | 'subscriptions'
  donation_settings: {
    amount_1: number
    amount_2: number
    amount_3: number
  }
  subscription_settings: {
    monthly_price: number
    quarterly_price: number
    yearly_price: number
  }
  support_settings: {
    support_title: string
    support_message: string
  }
  last_updated: string
}

export interface PaymentModelUpdateResponse {
  success: boolean
  message: string
  previous_payment_model: string
  current_payment_model: string
  changes_applied: {
    donation_amounts?: {
      amount_1: number
      amount_2: number
      amount_3: number
    }
    subscription_pricing?: {
      monthly_price: number
      quarterly_price: number
      yearly_price: number
    }
    support_messaging: {
      title: string
      message: string
    }
  }
  payment_settings: PaymentSettings
  updated_at: string
}

const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const response = await axiosInstance.get('/api/accounts/payment-settings')
  return response.data
}

const updatePaymentModel = async (payment_model: 'donations' | 'subscriptions'): Promise<PaymentModelUpdateResponse> => {
  const response = await axiosInstance.patch('/api/accounts/payment-settings/model', {
    payment_model
  })
  return response.data
}

const updateAccountPricing = async (pricingData: {
  // Donation pricing (only if in donations mode)
  custom_donation_amount_1?: number
  custom_donation_amount_2?: number
  custom_donation_amount_3?: number
  // Subscription pricing (only if in subscriptions mode)
  subscription_monthly_price?: number
  subscription_quarterly_price?: number
  subscription_yearly_price?: number
  // Support settings
  support_title?: string
  support_message?: string
  support_image?: number
}) => {
  const response = await axiosInstance.put('/api/accounts/update', pricingData)
  return response.data
}

export const paymentSettingsApi = {
  getPaymentSettings,
  updatePaymentModel,
  updateAccountPricing
}