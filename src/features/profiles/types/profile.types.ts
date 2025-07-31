export interface ProfileAccount {
  display_name: string;
  bio: string;
  short_bio: string;
  website_url: string;
  instagram_url: string;
  twitter_url: string;
  tiktok_url: string;
  farcaster_url: string;
  youtube_url: string;
  blog_url: string;
  stream_url: string;
  telegram_url: string;
  discord_url: string;
  link_section_title: string;
  background_color: string;
  banner_title: string;
  banner_color: string;
  banner_button_text: string;
  banner_button_link: string;
  account_type: string;
  profile_image_signed_url: string;
  background_image_signed_url: string;
  banner_image_signed_url: string;
  support_image: number;
  support_title: string;
  support_message: string;
  is_verified: boolean;
  background_text_color: string;
  
  // Payment model
  payment_model: 'donations' | 'subscriptions';
  
  // ✅ Move subscription_pricing BACK to account level to match your API
  subscription_pricing?: SubscriptionPricing;
  
  // Legacy fields (for backward compatibility if needed)
  custom_donation_amount_1?: number;
  custom_donation_amount_2?: number;
  custom_donation_amount_3?: number;
}

// Keep these interfaces the same
export interface DonationAmounts {
  amount_1: number;
  amount_2: number;
  amount_3: number;
}

export interface SubscriptionPricing {
  monthly_price: number;
  quarterly_price: number;
  yearly_price: number;
}

export interface ProfileData {
  account: ProfileAccount;
  media: ProfileMedia[];
  links: ProfileLink[];
  goal?: ProfileGoal;
  // ✅ Keep donation_amounts at root level (for when payment_model = 'donations')
  donation_amounts?: DonationAmounts;
  // ✅ Remove subscription_pricing from root since it's in account
}

export interface ProfileMedia {
  media_id: number;
  media_type: string;
  description: string;
  position: number;
  signed_url: string;
}

export interface ProfileLink {
  link_id: number;
  position: number;
  title: string;
  url: string;
  color: string | null;
  signed_image_url: string;
}

export interface ProfileGoal {
  goal_id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  progress_percentage: number;
  start_date: string;
  end_date: string;
  goal_type: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileData {
  account: ProfileAccount;
  media: ProfileMedia[];
  links: ProfileLink[];
  goal?: ProfileGoal;
  // ✅ Add these at root level to match API
  donation_amounts?: DonationAmounts;
  subscription_pricing?: SubscriptionPricing;
}

// New donation types
export interface DonationRequest {
  amount: number;
  donorName: string;
  donorMessage: string;
  donorEmail: string;
  socialPlatform: 'twitter' | 'instagram' | 'tiktok' | 'telegram' | null;
}

export interface DonationResponse {
  invoice_id: string;
  customer_id: string;
  payment_url: string;
  expires_at: string;
  amount_usd: number;
  session_token: string;
  signature: string;
  ws_signature: string;
}


// Add these interfaces to the existing types:

export interface SubscriptionRequest {
  subscription_months: number;
  subscriberEmail?: string;
  subscriberName: string;
  socialPlatform?: 'twitter' | 'instagram' | 'tiktok' | 'telegram' | null;
  subscriberMessage?: string;
}

export interface SubscriptionResponse {
  invoice_id: string;
  customer_id: string;
  payment_url: string;
  expires_at: string;
  amount_usd: number;
  subscription_months: number;
  monthly_rate: number;
  pricing_tier: 'monthly' | 'quarterly' | 'yearly';
  session_token: string;
  signature: string;
  ws_signature: string;
}