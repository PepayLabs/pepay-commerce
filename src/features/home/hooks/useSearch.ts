import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchParams, SearchResponse, Product } from '../types/search.types';
import { commerceApi } from '../api/commerceApi';
import { SearchCache } from '../utils/searchCache';
import { useDebounce } from '@/hooks/useDebounce';

interface UseSearchOptions {
  enableCache?: boolean;
  debounceMs?: number;
  onSuccess?: (response: SearchResponse) => void;
  onError?: (error: Error) => void;
}

interface UseSearchReturn {
  // State
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  products: Product[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  
  // Actions
  search: (params: SearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  retry: () => Promise<void>;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    enableCache = true,
    debounceMs = 300,
    onSuccess,
    onError,
  } = options;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Refs
  const lastSearchParams = useRef<SearchParams | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear results
  const clearResults = useCallback(() => {
    setProducts([]);
    setHasMore(false);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalResults(0);
    setError(null);
    lastSearchParams.current = null;
  }, []);

  // Refs for callbacks to prevent recreating functions
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Main search function - memoized with stable deps
  const performSearch = useCallback(
    async (params: SearchParams, append: boolean = false) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        // Check cache first
        if (enableCache && !append) {
          const cached = SearchCache.getSearch(params);
          if (cached) {
            console.log('🎯 Using cached search results');
            setProducts(cached.data.products);
            setHasMore(cached.data.pagination.hasNext);
            setCurrentPage(cached.data.pagination.page);
            setTotalPages(cached.data.pagination.totalPages);
            setTotalResults(cached.data.pagination.totalResults);
            setError(null);
            lastSearchParams.current = params;
            onSuccessRef.current?.(cached);
            return;
          }
        }

        // Perform API search
        const response = await commerceApi.searchProducts(params);
        
        // Save to cache
        if (enableCache) {
          SearchCache.saveSearch(params, response);
        }

        // Update state
        if (append) {
          setProducts(prev => [...prev, ...response.data.products]);
        } else {
          setProducts(response.data.products);
        }
        
        setHasMore(response.data.pagination.hasNext);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
        setTotalResults(response.data.pagination.totalResults);
        setError(null);
        lastSearchParams.current = params;
        
        onSuccessRef.current?.(response);
      } catch (err) {
        // Ignore aborted requests
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        const error = err instanceof Error ? err : new Error('Search failed');
        setError(error);
        onErrorRef.current?.(error);
        
        // Don't clear results on error if we're appending (load more)
        if (!append) {
          setProducts([]);
          setHasMore(false);
        }
      }
    },
    [enableCache] // Stable dependency
  );

  // Debounced search
  const debouncedSearch = useDebounce(performSearch, debounceMs);

  // Public search function
  const search = useCallback(
    async (params: SearchParams) => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (debounceMs > 0) {
          await debouncedSearch(params, false);
        } else {
          await performSearch(params, false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [performSearch, debouncedSearch, debounceMs]
  );

  // Load more function
  const loadMore = useCallback(async () => {
    if (!lastSearchParams.current || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      await performSearch(
        {
          ...lastSearchParams.current,
          page: currentPage + 1,
        },
        true // append results
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [performSearch, hasMore, isLoadingMore, currentPage]);

  // Retry function
  const retry = useCallback(async () => {
    if (!lastSearchParams.current) return;
    await search(lastSearchParams.current);
  }, [search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    isLoading,
    isLoadingMore,
    error,
    products,
    hasMore,
    currentPage,
    totalPages,
    totalResults,
    
    // Actions
    search,
    loadMore,
    clearResults,
    retry,
  };
};