import axios, { AxiosInstance } from 'axios';
import { SearchParams, SearchResponse } from '../types/search.types';

class CommerceApiClient {
  private client: AxiosInstance;

  constructor() {
    // Determine the base URL based on environment
    const baseURL = this.getBaseURL();
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor for logging in development
    if (import.meta.env.DEV) {
      this.client.interceptors.request.use((config) => {
        console.log('🔍 Commerce API Request:', {
          url: config.url,
          method: config.method,
          params: config.params,
        });
        return config;
      });
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (import.meta.env.DEV) {
          console.error('❌ Commerce API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  private getBaseURL(): string {
    // Check for environment variable first
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl) {
      return envApiUrl;
    }

    // Default to localhost in development, api.pepay.io in production
    if (import.meta.env.DEV) {
      return 'http://localhost:3000';
    }
    
    return 'https://api.pepay.io';
  }

  /**
   * Search for products
   * @param params Search parameters
   * @returns Promise with search results
   */
  async searchProducts(params: SearchParams): Promise<SearchResponse> {
    try {
      const response = await this.client.get<any>('/api/commerce/search', {
        params: {
          q: params.q,
          page: params.page || 1,
          retailer: params.retailer || 'amazon',
          ...(params.minPrice && { minPrice: params.minPrice }),
          ...(params.maxPrice && { maxPrice: params.maxPrice }),
        },
      });

      // Map the API response to our expected format
      return {
        ...response.data,
        data: {
          ...response.data.data,
          products: response.data.data.products.map((product: any) => ({
            ...product,
            stars: product.stars ?? product.rating ?? 0,
            numReviews: product.numReviews ?? product.reviewCount ?? 0,
            // Remove old fields to avoid confusion
            rating: undefined,
            reviewCount: undefined,
          })),
        },
      };
    } catch (error) {
      // If it's a 404, the API might not be available yet
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Return mock data for development
        if (import.meta.env.DEV) {
          console.warn('⚠️ Commerce API not available, returning mock data');
          return this.getMockSearchResponse(params);
        }
      }
      throw error;
    }
  }

  /**
   * Get product details by ID
   * @param productId Product ID
   * @param retailer Retailer name
   * @returns Promise with product details
   */
  async getProductDetails(productId: string, retailer: string = 'amazon') {
    const response = await this.client.get(`/api/commerce/products/${productId}`, {
      params: { retailer },
    });
    return response.data;
  }

  /**
   * Get mock search response for development
   */
  private getMockSearchResponse(params: SearchParams): SearchResponse {
    return {
      success: true,
      data: {
        products: [
          {
            productId: "MOCK001",
            title: "Premium Wireless Headphones with Active Noise Cancellation - 30 Hour Battery Life",
            price: 79.99,
            image: "https://via.placeholder.com/300x300?text=Headphones",
            stars: 4.5,
            numReviews: 1234,
            fresh: false,
            retailer: "amazon",
            url: "#",
            brand: "AudioTech",
            categories: ["Electronics", "Audio", "Headphones"]
          },
          {
            productId: "MOCK002",
            title: "Ultra-Comfortable Over-Ear Headphones",
            price: 49.99,
            image: "https://via.placeholder.com/300x300?text=Over-Ear",
            stars: 4.3,
            numReviews: 567,
            fresh: false,
            retailer: "amazon",
            url: "#",
            brand: "SoundPro",
            categories: ["Electronics", "Audio", "Headphones"]
          },
        ],
        pagination: {
          page: params.page || 1,
          totalPages: 5,
          totalResults: 50,
          hasNext: true,
        },
        query: params.q,
        retailer: params.retailer || 'amazon',
      },
      meta: {
        timestamp: new Date().toISOString(),
        cacheStats: {
          search: { size: 0, maxSize: 500 },
          product: { size: 0, maxSize: 1000 },
          offer: { size: 0, maxSize: 500 },
        },
      },
    };
  }
}

// Export a singleton instance
export const commerceApi = new CommerceApiClient();