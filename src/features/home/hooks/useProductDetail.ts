import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Cache for product details - store in memory for 30 days
const PRODUCT_DETAIL_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface ProductDetail {
  productId: string;
  asin: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  mainImage: string;
  description: string;
  bullets: string[];
  productDetails: string[];
  brand: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  questionCount: number;
  variants?: any[];
  variantSpecifics?: any[];
  dimensions?: any;
  epids?: any[];
  epidsMap?: any;
  retailer: string;
  shipPrice: number;
  fresh: boolean;
  pantry: boolean;
  handmade: boolean;
  digital: boolean;
  buyapiHint: boolean;
  availability: string;
  numSales: number;
  numOffers: number;
  giftCard: boolean;
  addon: boolean;
  parentAsin?: string;
  customizable: boolean;
  digitalSubscription: boolean;
  blankBox: boolean;
}

interface UseProductDetailOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' 
    ? 'https://api.pepay.io' 
    : 'http://localhost:3000'
);

// Function to get cached data
const getCachedProductDetail = (key: string): ProductDetail | null => {
  const cached = PRODUCT_DETAIL_CACHE.get(key);
  if (cached) {
    const now = Date.now();
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    } else {
      // Remove expired cache
      PRODUCT_DETAIL_CACHE.delete(key);
    }
  }
  return null;
};

// Function to set cache
const setCachedProductDetail = (key: string, data: ProductDetail) => {
  PRODUCT_DETAIL_CACHE.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Fetch product details from API
const fetchProductDetail = async (
  productId: string,
  retailer: string = 'amazon'
): Promise<ProductDetail> => {
  const cacheKey = `${retailer}-${productId}`;
  
  // Check cache first
  const cached = getCachedProductDetail(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/commerce/products/${productId}`,
      {
        params: { retailer },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.data.success && response.data.data) {
      const productDetail = response.data.data as ProductDetail;
      
      // Cache the successful response
      setCachedProductDetail(cacheKey, productDetail);
      
      return productDetail;
    } else {
      throw new Error(response.data.error?.message || 'Failed to fetch product details');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(error.response?.data?.error?.message || 'Network error');
    }
    throw error;
  }
};

export const useProductDetail = (
  productId: string,
  retailer: string = 'amazon',
  options: UseProductDetailOptions = {}
) => {
  const {
    enabled = true,
    staleTime = 30 * 60 * 1000, // 30 minutes
    cacheTime = 60 * 60 * 1000, // 1 hour
  } = options;

  return useQuery<ProductDetail, Error>({
    queryKey: ['productDetail', retailer, productId],
    queryFn: () => fetchProductDetail(productId, retailer),
    enabled: enabled && !!productId,
    staleTime,
    cacheTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Export cache management utilities
export const clearProductDetailCache = () => {
  PRODUCT_DETAIL_CACHE.clear();
};

export const removeProductFromCache = (productId: string, retailer: string = 'amazon') => {
  const cacheKey = `${retailer}-${productId}`;
  PRODUCT_DETAIL_CACHE.delete(cacheKey);
};

// Function to preload product details (useful for hover states)
export const preloadProductDetail = (productId: string, retailer: string = 'amazon') => {
  const cacheKey = `${retailer}-${productId}`;
  
  // Check if already cached
  const cached = getCachedProductDetail(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  // Fetch and cache
  return fetchProductDetail(productId, retailer).catch(() => {
    // Silently fail for preloading
    return null;
  });
};