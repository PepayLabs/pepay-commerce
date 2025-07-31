import { axiosInstance } from '@/lib/axios';

export interface ContentPurchaseRequest {
  // The API expects an empty body for anonymous purchases
  // but we'll keep this interface for future extensibility
}

export interface ContentPurchaseResponse {
  invoice_id: string;
  purchase_id: string;
  customer_id: string;
  payment_url: string;
  expires_at: string;
  amount_usd: number;
  content: {
    content_id: string;
    title: string;
    content_type: 'video' | 'audio' | 'image';
    price: number;
    size_bytes: number;
  };
  creator: {
    account_id: string;
    display_name: string;
    display_link: string;
  };
  session_token: string;
  signature: string;
  ws_signature: string;
}

export async function createContentPurchase(
  displayLink: string,
  contentId: string,
  purchaseData: ContentPurchaseRequest = {}
): Promise<ContentPurchaseResponse> {
  console.log(`🛒 Creating content purchase for ${displayLink}/${contentId}`);
  
  const response = await axiosInstance.post(
    `/api/profiles/${displayLink}/content/${contentId}/purchase`,
    purchaseData
  );
  
  console.log('✅ Content purchase response:', response.data);
  return response.data;
}