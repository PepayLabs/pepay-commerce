import { useState } from 'react';
import { ContentPurchaseRequest, ContentPurchaseResponse, createContentPurchase } from '../api/contentPurchaseApi';

export function useContentPurchase() {
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<Error | null>(null);

  const submitPurchase = async (
    displayLink: string,
    contentId: string,
    purchaseData: ContentPurchaseRequest = {}
  ): Promise<ContentPurchaseResponse | null> => {
    setPurchaseLoading(true);
    setPurchaseError(null);
    
    try {
      const response = await createContentPurchase(displayLink, contentId, purchaseData);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Content purchase failed');
      setPurchaseError(error);
      return null;
    } finally {
      setPurchaseLoading(false);
    }
  };

  return { submitPurchase, purchaseLoading, purchaseError };
}