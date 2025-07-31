import { axiosInstance } from '@/lib/axios';
import { userAuth } from '@/lib/userAuth';
import { PostMedia } from './user-posts.api';
import { UserAccount } from '@/lib/userAuth';

export interface EnhancedPostsApiParams {
  displayLink: string;
  limit?: number;
  offset?: number;
  page?: number;
  tierFilter?: 'free' | 'subscriber' | 'all';
  accountId?: string;
  mediaOnly?: boolean;
  contentType?: 'all' | 'free' | 'subscriber';
}

export interface UnifiedPostsResponse {
  success: boolean;
  posts: PostMedia[];
  pagination: any;
  account?: any;
  walletInfo?: {
    walletAddress: string;
    accessibleAccounts: number;
    totalDonated: number;
  };
  isPrivateAPI: boolean;
}

export const enhancedUserPostsApi = {
  /**
   * Smart API router - chooses between public/private based on auth status
   */
  async getPosts(params: EnhancedPostsApiParams): Promise<UnifiedPostsResponse> {
    // 1. Check if user is authenticated
    const authState = userAuth.getAuthState();
    
    if (!authState.isAuthenticated) {
      return this.getPublicPosts(params);
    }

    // 2. Ensure token is still valid and refresh permissions if needed
    const isValidToken = await userAuth.ensureValidToken();
    
    if (!isValidToken) {
      return this.getPublicPosts(params);
    }

    // 3. Check if user has access to this specific creator
    const hasAccess = userAuth.hasAccessToCreator(params.displayLink);
    
    if (hasAccess) {
      return this.getPrivatePosts(params);
    } else {
      return this.getPublicPosts(params);
    }
  },

  /**
   * Public API - for unauthenticated users or users without access
   */
  async getPublicPosts(params: EnhancedPostsApiParams): Promise<UnifiedPostsResponse> {
    const { displayLink, limit = 7, offset = 0, tierFilter = 'all' } = params;
    
    try {
      const response = await axiosInstance.get(`/api/profiles/${displayLink}/posts`, {
        params: {
          limit,
          offset,
          tierFilter
        }
      });
      
      // Normalize public API response
      return {
        success: true,
        posts: response.data.posts,
        pagination: response.data.pagination,
        account: response.data.account,
        isPrivateAPI: false
      };
    } catch (error) {
      console.error('Error fetching public posts:', error);
      throw error;
    }
  },

  /**
   * Private API - for authenticated users with access
   */
  async getPrivatePosts(params: EnhancedPostsApiParams): Promise<UnifiedPostsResponse> {
    const { displayLink, limit = 7, offset = 0, mediaOnly = false, contentType = 'all' } = params;
    
    const accessToken = userAuth.getAccessToken();
    
    // Get accountId from permissions - Updated for new object structure
    const permissions = userAuth.getPermissions();
    
    // Method 1: Direct access by displayLink key (most efficient)
    let account: UserAccount | undefined = permissions?.accounts[displayLink.toLowerCase()];
    
    // Method 2: Fallback - search through all accounts if direct access fails
    if (!account && permissions?.accounts) {
      account = Object.values(permissions.accounts).find(acc => 
        acc.displayLink.toLowerCase() === displayLink.toLowerCase()
      );
    }
    
    if (!account) {
      console.log(`❌ [Enhanced API] No account access found for ${displayLink}`)
      console.log('🔍 [Enhanced API] Available accounts:', Object.keys(permissions?.accounts || {}))
      return this.getPublicPosts(params);
    }
    
    // TypeScript should now know account is defined
    const accountId = account!.accountId; // Use non-null assertion
    
    console.log(`✅ [Enhanced API] Found accountId for ${displayLink}:`, accountId)
    
    try {
      const page = Math.floor(offset / limit) + 1;
      
      const requestConfig = {
        headers: {
          'USER_AUTHORIZATION': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          page,
          limit,
          accountId: accountId,
          mediaOnly,
          contentType
        }
      };
      
      console.log('🔒 [Enhanced API] Making private posts request with:', {
        displayLink,
        accountId: accountId,
        page,
        limit,
        hasToken: !!accessToken
      })
      
      const response = await axiosInstance.get('/api/accounts/private-posts', requestConfig);
      
      // Normalize private API response
      return {
        success: response.data.success,
        posts: response.data.posts,
        pagination: response.data.pagination,
        // Extract account from first post if not provided at top level
        account: response.data.account || (response.data.posts?.[0]?.account ? {
          display_name: response.data.posts[0].account.display_name,
          display_link: response.data.posts[0].account.display_link,
          profile_image_url: response.data.posts[0].account.profile_image_url,
          background_text_color: response.data.posts[0].account.background_text_color,
          background_image_url: response.data.posts[0].account.background_image_url,
        } : undefined),
        walletInfo: response.data.walletInfo,
        isPrivateAPI: true
      };
    } catch (error: any) {
      console.error('❌ [Enhanced API] Private posts request failed')
      console.error('🔒 [Enhanced API] Error status:', error.response?.status)
      console.error('🔒 [Enhanced API] Error data:', error.response?.data)
      console.error('🔒 [Enhanced API] Error headers sent:', error.config?.headers)
      console.error('🔒 [Enhanced API] Full error:', error)
      
      // Check if it's specifically a 401 unauthorized
      if (error.response?.status === 401) {
        console.warn('🔒 [Enhanced API] 401 Unauthorized - Token might be invalid or wrong type')
        console.warn('🔒 [Enhanced API] Attempting to refresh permissions...')
        
        // Try to refresh permissions
        await this.refreshUserPermissions();
        
        // Don't retry immediately, just fall back to public
        console.warn('🔒 [Enhanced API] Falling back to public API after 401')
      }
      
      // Fallback to public API if private fails
      return this.getPublicPosts(params);
    }
  },

  /**
   * Get account ID from display link for private API
   */
  async getAccountIdFromDisplayLink(displayLink: string): Promise<string | null> {
    const permissions = userAuth.getPermissions();
    if (!permissions?.accounts) return null;
    
    // Try direct access first
    let account = permissions.accounts[displayLink.toLowerCase()];
    
    // Fallback to searching through all accounts
    if (!account) {
      account = Object.values(permissions.accounts).find(acc => 
        acc.displayLink.toLowerCase() === displayLink.toLowerCase()
      );
    }
    
    return account?.accountId || null;
  },

  /**
   * Force refresh user permissions (call when user might have new access)
   */
  async refreshUserPermissions(): Promise<boolean> {
    try {
      const validation = await userAuth.validateTokenSilent();
      if (validation?.valid && validation.permissions) {
        // Update stored permissions with correct field name
        userAuth.storeCredentials({
          accessToken: userAuth.getAccessToken() || '',
          permissions: validation.permissions,
          expiresAt: userAuth.getAuthState().expiresAt || '',
          walletType: userAuth.getAuthState().walletType as any,
          message: 'Permissions refreshed',
          success: true,
          credentialId: validation.credentialId
        }, validation.walletAddress);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      return false;
    }
  },

  /**
   * Check if more posts are available (works for both APIs)
   */
  hasMorePosts(response: UnifiedPostsResponse): boolean {
    if ('pagination' in response && typeof response.pagination === 'object') {
      return response.pagination.has_next_page || false;
    }
    return false;
  },

  /**
   * Get next page parameters (works for both APIs)
   */
  getNextPageParams(
    response: UnifiedPostsResponse, 
    currentParams: EnhancedPostsApiParams
  ): EnhancedPostsApiParams | null {
    if (!this.hasMorePosts(response)) return null;
    
    if ('pagination' in response && typeof response.pagination === 'object') {
      return {
        ...currentParams,
        offset: response.pagination.next_offset || 0
      };
    }
    
    return null;
  }
};