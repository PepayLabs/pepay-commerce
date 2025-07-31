import { ContentResponse, ContentFilters, PrivateContentResponse, UnifiedContentResponse } from '../types/content.types';
import { UserAuthService } from '../../../lib/userAuth';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Check if user is authenticated with wallet
 */
function isWalletAuthenticated(): boolean {
  const authState = UserAuthService.getAuthState();
  return authState.isAuthenticated && !authState.isExpired;
}

/**
 * Get authentication headers for private API
 */
function getAuthHeaders(): HeadersInit {
  const token = UserAuthService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'USER_AUTHORIZATION': `Bearer ${token}`
  };
}

/**
 * Fetch content from private API for authenticated users
 */
export async function fetchPrivateContent(
  filters: ContentFilters = {}
): Promise<PrivateContentResponse> {
  const { content_type, limit = 6, offset = 0, account_id, purchase_status } = filters;
  
  const searchParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (content_type) {
    searchParams.append('content_type', content_type);
  }
  
  if (account_id) {
    searchParams.append('account_id', account_id);
  }

  if (purchase_status) {
    searchParams.append('purchase_status', purchase_status);
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/accounts/private-content?${searchParams}`,
    {
      headers: getAuthHeaders()
    }
  );
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 403) {
      throw new Error('Access denied');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`Error fetching private content: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Fetch content from public API (original function)
 */
export async function fetchProfileContent(
  displayLink: string,
  filters: ContentFilters = {}
): Promise<ContentResponse> {
  const { content_type, limit = 9, offset = 0 } = filters;
  
  const searchParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (content_type) {
    searchParams.append('content_type', content_type);
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/profiles/${displayLink}/content?${searchParams}`
  );
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Profile not found');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`Error fetching content: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get account_id for a displayLink from user permissions
 */
function getAccountIdFromDisplayLink(displayLink: string): string | null {
  const permissions = UserAuthService.getPermissions();
  if (!permissions?.accounts) return null;
  
  const account = Object.values(permissions.accounts).find(acc => 
    acc.displayLink.toLowerCase() === displayLink.toLowerCase()
  );
  
  return account?.accountId || null;
}

/**
 * Main content fetching function that chooses between public and private API
 * based on authentication status
 */
export async function fetchContent(
  displayLink?: string,
  filters: ContentFilters = {}
): Promise<UnifiedContentResponse> {
  const isAuthenticated = isWalletAuthenticated();
  
  console.log('🔐 Content fetch - Auth status:', isAuthenticated);
  console.log('🔍 Content fetch - Display link:', displayLink);
  
  if (isAuthenticated) {
    try {
      // For authenticated users, use private content API
      console.log('📱 Fetching private content feed...');
      
      let privateFilters = { ...filters };
      
      // If displayLink is provided, try to get the account_id for filtering
      if (displayLink) {
        const accountId = getAccountIdFromDisplayLink(displayLink);
        if (accountId) {
          privateFilters.account_id = accountId;
          console.log('🎯 Filtering private content by account_id:', accountId);
        } else {
          console.log('⚠️ No account_id found for displayLink, fetching all private content');
        }
      }
      
      const privateResponse = await fetchPrivateContent(privateFilters);
      
      // 🔧 NORMALIZE: Extract account from first content item for private API
      let accountInfo: ContentAccount | undefined;
      if (privateResponse.content.length > 0 && privateResponse.content[0].account) {
        accountInfo = privateResponse.content[0].account;
      }
      
      return {
        content: privateResponse.content,
        pagination: privateResponse.pagination,
        account: accountInfo, // ✅ Now we have account at top level
        accessInfo: privateResponse.accessInfo,
        cached: privateResponse.cached,
        isPrivateResponse: true
      };
    } catch (error) {
      console.warn('⚠️ Private content fetch failed, falling back to public API:', error);
      // Fall back to public API if private fails
    }
  }
  
  // For unauthenticated users or private API fallback
  if (!displayLink) {
    throw new Error('Display link is required for public content API');
  }
  
  console.log('🌐 Fetching public content for profile:', displayLink);
  const publicResponse = await fetchProfileContent(displayLink, filters);
  
  return {
    content: publicResponse.content.map(item => ({
      ...item,
      has_access: item.has_access,
      is_purchased: false // Not purchased since user is not authenticated or private API failed
    })),
    pagination: publicResponse.pagination,
    account: publicResponse.account, // ✅ Public API already has account at top level
    isPrivateResponse: false
  };
}

export async function trackContentView(contentId: string): Promise<void> {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    // Add auth headers if user is authenticated
    if (isWalletAuthenticated()) {
      Object.assign(headers, getAuthHeaders());
    }
    
    await fetch(`${API_BASE_URL}/api/content/${contentId}/view`, {
      method: 'POST',
      headers
    });
  } catch (error) {
    // Non-blocking view tracking - don't throw errors
    console.log('View tracking failed:', error);
  }
}