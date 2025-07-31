import { SearchCacheEntry, SearchParams, SearchResponse, SearchSuggestion } from '../types/search.types';

const CACHE_KEY_PREFIX = 'pepay_search_cache_';
const SUGGESTIONS_KEY = 'pepay_search_suggestions';
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_SUGGESTIONS = 20;
const MAX_CACHE_ENTRIES = 100;

// In-memory cache for performance
let suggestionsCache: SearchSuggestion[] | null = null;
let cacheInitialized = false;

// Memoized filtered results to prevent re-computation
let lastFilterQuery = '';
let lastFilterResult: SearchSuggestion[] = [];

export class SearchCache {
  /**
   * Initialize in-memory cache
   */
  private static initializeCache() {
    if (!cacheInitialized) {
      try {
        const stored = localStorage.getItem(SUGGESTIONS_KEY);
        suggestionsCache = stored ? JSON.parse(stored) : [];
        cacheInitialized = true;
      } catch (error) {
        console.error('Failed to initialize cache:', error);
        suggestionsCache = [];
        cacheInitialized = true;
      }
    }
  }
  /**
   * Generate a unique cache key for search parameters
   */
  private static generateCacheKey(params: SearchParams): string {
    const { q, page = 1, retailer = 'amazon', minPrice, maxPrice } = params;
    const keyParts = [
      q.toLowerCase().trim(),
      page,
      retailer,
      minPrice || '',
      maxPrice || '',
    ];
    return CACHE_KEY_PREFIX + keyParts.join('_');
  }

  /**
   * Save search results to cache
   */
  static saveSearch(params: SearchParams, response: SearchResponse): void {
    try {
      const cacheKey = this.generateCacheKey(params);
      const expiresAt = new Date(Date.now() + CACHE_DURATION_MS).toISOString();
      
      const cacheEntry: SearchCacheEntry = {
        query: params.q,
        params,
        response,
        timestamp: new Date().toISOString(),
        expiresAt,
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      // Also save to suggestions if it's the first page
      if (params.page === 1 || !params.page) {
        this.saveSuggestion(params.q, response.data.products.length);
      }

      // Clean up old cache entries
      this.cleanupCache();
    } catch (error) {
      console.error('Failed to save search to cache:', error);
    }
  }

  /**
   * Get cached search results
   */
  static getSearch(params: SearchParams): SearchResponse | null {
    try {
      const cacheKey = this.generateCacheKey(params);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheEntry: SearchCacheEntry = JSON.parse(cached);
      
      // Check if cache is expired
      if (new Date(cacheEntry.expiresAt) < new Date()) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheEntry.response;
    } catch (error) {
      console.error('Failed to get search from cache:', error);
      return null;
    }
  }

  /**
   * Save search suggestion
   */
  private static saveSuggestion(query: string, resultCount: number): void {
    try {
      this.initializeCache();
      
      if (!suggestionsCache) {
        suggestionsCache = [];
      }
      
      // Remove existing suggestion for the same query
      suggestionsCache = suggestionsCache.filter(
        s => s.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add new suggestion at the beginning
      const newSuggestion: SearchSuggestion = {
        query,
        timestamp: new Date().toISOString(),
        resultCount,
      };
      
      suggestionsCache.unshift(newSuggestion);
      
      // Keep only the most recent suggestions
      suggestionsCache = suggestionsCache.slice(0, MAX_SUGGESTIONS);
      
      // Save to localStorage asynchronously
      const saveToStorage = () => {
        try {
          localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestionsCache));
        } catch (error) {
          console.error('Failed to persist suggestions:', error);
        }
      };

      // Use requestIdleCallback if available, otherwise use setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(saveToStorage);
      } else {
        setTimeout(saveToStorage, 0);
      }
    } catch (error) {
      console.error('Failed to save search suggestion:', error);
    }
  }

  /**
   * Get search suggestions
   */
  static getSuggestions(): SearchSuggestion[] {
    try {
      this.initializeCache();
      return suggestionsCache || [];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Get filtered suggestions based on current query
   */
  static getFilteredSuggestions(query: string): SearchSuggestion[] {
    if (!query || query.length < 1) return [];
    
    // Return memoized result if query hasn't changed
    if (query === lastFilterQuery) {
      return lastFilterResult;
    }
    
    const suggestions = this.getSuggestions();
    const lowerQuery = query.toLowerCase();
    
    // Fast path: if query starts with previous query, filter from previous results
    if (lastFilterQuery && query.startsWith(lastFilterQuery) && lastFilterResult.length > 0) {
      const filtered = lastFilterResult.filter(s => 
        s.query.toLowerCase().includes(lowerQuery)
      );
      
      if (filtered.length >= 3) {
        lastFilterQuery = query;
        lastFilterResult = filtered.slice(0, 8);
        return lastFilterResult;
      }
    }
    
    // Use startsWith for better performance and UX
    const startsWithResults = suggestions.filter(s => 
      s.query.toLowerCase().startsWith(lowerQuery)
    );
    
    // If we have enough startsWith results, return those
    if (startsWithResults.length >= 5) {
      lastFilterQuery = query;
      lastFilterResult = startsWithResults.slice(0, 8);
      return lastFilterResult;
    }
    
    // Otherwise, also include contains matches
    const containsResults = suggestions.filter(s => 
      !s.query.toLowerCase().startsWith(lowerQuery) &&
      s.query.toLowerCase().includes(lowerQuery)
    );
    
    lastFilterQuery = query;
    lastFilterResult = [...startsWithResults, ...containsResults].slice(0, 8);
    return lastFilterResult;
  }

  /**
   * Clear all search cache
   */
  static clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem(SUGGESTIONS_KEY);
    } catch (error) {
      console.error('Failed to clear search cache:', error);
    }
  }

  /**
   * Clean up old cache entries
   */
  private static cleanupCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      // If we have too many cache entries, remove the oldest ones
      if (cacheKeys.length > MAX_CACHE_ENTRIES) {
        const entries: Array<{ key: string; timestamp: string }> = [];
        
        cacheKeys.forEach(key => {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}');
            if (entry.timestamp) {
              entries.push({ key, timestamp: entry.timestamp });
            }
          } catch (e) {
            // Remove invalid entries
            localStorage.removeItem(key);
          }
        });
        
        // Sort by timestamp (oldest first)
        entries.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        // Remove oldest entries
        const entriesToRemove = entries.length - MAX_CACHE_ENTRIES;
        for (let i = 0; i < entriesToRemove; i++) {
          localStorage.removeItem(entries[i].key);
        }
      }
      
      // Remove expired entries
      cacheKeys.forEach(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      
      let totalSize = 0;
      let oldestTimestamp: string | null = null;
      let newestTimestamp: string | null = null;
      
      cacheKeys.forEach(key => {
        const value = localStorage.getItem(key) || '';
        totalSize += value.length;
        
        try {
          const entry = JSON.parse(value);
          if (entry.timestamp) {
            if (!oldestTimestamp || entry.timestamp < oldestTimestamp) {
              oldestTimestamp = entry.timestamp;
            }
            if (!newestTimestamp || entry.timestamp > newestTimestamp) {
              newestTimestamp = entry.timestamp;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });
      
      return {
        totalEntries: cacheKeys.length,
        totalSize: Math.round(totalSize / 1024), // in KB
        oldestEntry: oldestTimestamp,
        newestEntry: newestTimestamp,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }
}