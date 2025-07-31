export interface BlockchainData {
  payer_address?: string;
  network?: string;
  wallet_address?: string;
  settlement_address?: string; // Added this field
  token_name?: string;
  token_symbol?: string;
  tx_hash?: string;
}

export interface RetryInfo {
  fetch_attempts: number;
  last_attempted: string;
}

export interface Invoice {
  transaction_id: string;
  transaction_type: 'donation' | 'subscription' | 'content' | 'package';
  invoice_id: string;
  amount_usd: number;
  payer_name: string;
  payer_email?: string;
  transaction_message?: string;
  response_message?: string;
  social_platform?: 'telegram' | 'twitter' | 'farcaster' | 'instagram' | 'tiktok';
  blockchain_data?: BlockchainData;
  content_title?: string;
  content_type?: 'image' | 'video' | 'audio' | 'text';
  months_purchased?: number;
  months_remaining?: number;
  is_public: boolean;
  created_at: string;
  paid_at: string;
  updated_at: string;
  retry_info?: RetryInfo;
}

// Updated to match actual API response structure
export interface PaymentTotals {
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

export interface PaymentsPagination {
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
  filtered_count: number;
}

export interface PaymentsMetadata {
  missing_blockchain_data_count: number;
  retry_candidates: number; // Added this field
  query_execution_time: number;
}

export interface PaymentsResponse {
  invoices: Invoice[];
  pagination: PaymentsPagination;
  totals: PaymentTotals;
  metadata: PaymentsMetadata;
}

// Updated to match what components expect
export interface PaymentFilters {
  type?: string;
  timeRange?: string;
  visibility?: string;
  limit?: number;
  offset?: number;
  include_retry_info?: boolean;
  only_complete_data?: boolean;
}

export interface UpdateVisibilityRequest {
  is_public: boolean;
}

export interface UpdateResponseRequest {
  response_message: string;
} 