// Product data types
export interface Product {
  productId: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  fresh: boolean;
  retailer: string;
  url: string;
}

// Pagination data
export interface Pagination {
  page: number;
  totalPages: number;
  totalResults: number;
  hasNext: boolean;
}

// Search response data
export interface SearchData {
  products: Product[];
  pagination: Pagination;
  query: string;
  retailer: string;
}

// Cache statistics
export interface CacheStats {
  search: {
    size: number;
    maxSize: number;
  };
  product: {
    size: number;
    maxSize: number;
  };
  offer: {
    size: number;
    maxSize: number;
  };
}

// Meta information
export interface SearchMeta {
  timestamp: string;
  cacheStats: CacheStats;
}

// Complete API response
export interface SearchResponse {
  success: boolean;
  data: SearchData;
  meta: SearchMeta;
}

// Search parameters
export interface SearchParams {
  q: string;
  page?: number;
  retailer?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Search cache entry
export interface SearchCacheEntry {
  query: string;
  params: SearchParams;
  response: SearchResponse;
  timestamp: string;
  expiresAt: string;
}

// Search suggestion
export interface SearchSuggestion {
  query: string;
  timestamp: string;
  resultCount: number;
}