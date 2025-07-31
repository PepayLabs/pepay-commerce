import { axiosInstance as axios } from '@/lib/axios'

// Updated types based on new API responses
export interface UserAccount {
  accountId: string
  displayName: string
  displayLink: string
  profileImageUrl?: string
  permissionType: 'donation' | 'subscription'
  expiresAt?: string
  isActive: boolean
  // For donation type
  totalDonated?: number
  lastDonation?: string
  // For subscription type
  monthsRemaining?: number
}

export interface ContentItem {
  contentId: string
  title: string
  coverImageUrl?: string
  accessType: 'permanent' | 'temporary'
  purchasedAt?: string
  price?: number
  creatorId: string
  packageId?: string
}

export interface Package {
  packageId: string
  title: string
  contentIds: string[]
  purchasedAt: string
  price: number
  creatorId: string
}

export interface AccessPermissions {
  walletAddress: string
  accounts: Record<string, UserAccount>
  content: Record<string, ContentItem>
  packages: Record<string, Package>
  summary: {
    totalAccounts: number
    totalContent: number
    totalPackages: number
    totalSpent: number
    creatorsSupported: number
    lastActivity: string
    accessTypes: string[]
    activeSubscriptions: number
  }
  refreshedAt: string
  version: string
  source: string
  responseTime: number
}

export interface UserAuthResult {
  success: boolean
  accessToken: string
  expiresAt: string
  walletType: 'ethereum' | 'solana'
  credentialId: string
  permissions: AccessPermissions
  message: string
}

export interface TokenValidationResult {
  valid: boolean
  walletAddress: string
  credentialId: string
  expiresAt: string
  issuedAt: string
  lastUsed: string
  permissions: AccessPermissions
}

export interface LogoutResult {
  success: boolean
  message: string
  logoutType: string
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'user_access_token',
  PERMISSIONS: 'user_access_permissions', 
  EXPIRES_AT: 'user_access_expires',
  WALLET_ADDRESS: 'user_wallet_address',
  WALLET_TYPE: 'user_wallet_type'
} as const

export class UserAuthService {
  /**
   * Complete EVM wallet authentication flow
   */
  static async authenticateEVM(
    walletAddress: string,
    signMessageFn: (message: string) => Promise<string>
  ): Promise<UserAuthResult> {
    try {
      // Step 1: Get challenge
      const challengeResponse = await axios.post('/api/auth/wallet/challenge', {
        walletAddress,
        walletType: 'ethereum'
      })

      const { challengeId, message } = challengeResponse.data

      // Step 2: Sign message
      const signature = await signMessageFn(message)

      // Step 3: Verify and get access
      const verifyResponse = await axios.post('/api/auth/wallet/verify', {
        challengeId,
        signature,
        walletAddress,
        walletType: 'ethereum'
      })

      const result = verifyResponse.data
      
      // Store credentials
      this.storeCredentials(result, walletAddress)
      
      return result
    } catch (error) {
      throw new Error(`EVM Authentication failed: ${error}`)
    }
  }

  /**
   * Authenticate Solana wallet (future implementation)
   */
  static async authenticateSOL(
    walletAddress: string,
    signMessageFn: (message: string) => Promise<string>
  ): Promise<UserAuthResult> {
    // TODO: Implement Solana authentication
    throw new Error('Solana authentication not implemented yet')
  }

  /**
   * Validate existing access token
   */
  static async validateToken(): Promise<TokenValidationResult | null> {
    const token = this.getAccessToken()
    
    console.log('🔐 [UserAuth] validateToken called')
    console.log('🔐 [UserAuth] Token exists:', !!token)
    console.log('🔐 [UserAuth] Token preview:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (!token) {
      console.log('❌ [UserAuth] No token found, returning null')
      return null
    }

    try {
      console.log('🔐 [UserAuth] Sending token validation request...')
      const response = await axios.post('/api/auth/wallet/verify-token', {}, {
        headers: { 
          USER_AUTHORIZATION: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ [UserAuth] Token validation successful')
      console.log('🔐 [UserAuth] Validation response:', {
        valid: response.data.valid,
        walletAddress: response.data.walletAddress,
        credentialId: response.data.credentialId,
        expiresAt: response.data.expiresAt,
        accountsCount: Object.keys(response.data.permissions?.accounts || {}).length
      })
      
      return response.data
    } catch (error: any) {
      console.error('❌ [UserAuth] Token validation failed')
      console.error('🔐 [UserAuth] Error status:', error.response?.status)
      console.error('🔐 [UserAuth] Error data:', error.response?.data)
      console.error('🔐 [UserAuth] Full error:', error)
      
      this.clearCredentials()
      return null
    }
  }

  /**
   * Validate token without clearing credentials on failure
   */
  static async validateTokenSilent(): Promise<TokenValidationResult | null> {
    const token = this.getAccessToken()
    
    console.log('🔐 [UserAuth] validateTokenSilent called')
    console.log('🔐 [UserAuth] Token exists:', !!token)
    
    if (!token) {
      console.log('❌ [UserAuth] No token found for silent validation')
      return null
    }

    try {
      console.log('🔐 [UserAuth] Sending silent token validation...')
      const response = await axios.post('/api/auth/wallet/verify-token', {}, {
        headers: { 
          USER_AUTHORIZATION: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ [UserAuth] Silent validation successful')
      console.log('🔐 [UserAuth] Silent response:', {
        valid: response.data.valid,
        walletAddress: response.data.walletAddress,
        credentialId: response.data.credentialId,
        expiresAt: response.data.expiresAt,
        accountsCount: Object.keys(response.data.permissions?.accounts || {}).length
      })
      
      return response.data
    } catch (error: any) {
      console.error('❌ [UserAuth] Silent validation failed')
      console.error('🔐 [UserAuth] Silent error status:', error.response?.status)
      console.error('🔐 [UserAuth] Silent error data:', error.response?.data)
      
      // Don't clear credentials - let the caller decide
      return null
    }
  }

  /**
   * Store user credentials securely
   */
  static storeCredentials(result: UserAuthResult, walletAddress: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.accessToken)
    
    // Only store permissions if they exist and are valid
    if (result.permissions && typeof result.permissions === 'object') {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(result.permissions))
    } else {
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS) // Remove invalid permissions
    }
    
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, result.expiresAt)
    localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, walletAddress)
    localStorage.setItem(STORAGE_KEYS.WALLET_TYPE, result.walletType)
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  /**
   * Get stored user permissions
   */
  static getPermissions(): AccessPermissions | null {
    const permissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS)
    
    // Check if permissions exist and are not the string "undefined"
    if (!permissions || permissions === 'undefined' || permissions === 'null') {
      return null
    }
    
    try {
      return JSON.parse(permissions)
    } catch (error) {
      console.error('Failed to parse stored permissions:', error)
      // Clear corrupted permissions
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS)
      return null
    }
  }

  /**
   * Get current authentication state
   */
  static getAuthState() {
    // Clean up any corrupted data first
    this.clearCorruptedCredentials()
    
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const permissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS)
    const expires = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)
    const walletAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
    const walletType = localStorage.getItem(STORAGE_KEYS.WALLET_TYPE)
    
    const authState = {
      isAuthenticated: Boolean(token && expires && new Date(expires) > new Date()),
      accessToken: token,
      permissions: permissions && permissions !== 'undefined' ? JSON.parse(permissions) : null,
      expiresAt: expires,
      walletAddress,
      walletType,
      isExpired: expires ? new Date(expires) < new Date() : true
    }
    
    console.log('🔐 [UserAuth] Current auth state:', {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      expiresAt: expires,
      isExpired: authState.isExpired,
      walletAddress,
      accountsCount: authState.permissions ? Object.keys(authState.permissions.accounts || {}).length : 0
    })
    
    return authState
  }

  /**
   * Check if user has access to specific creator
   */
  static hasAccessToCreator(displayLink: string): boolean {
    const permissions = this.getPermissions()
    if (!permissions || !permissions.accounts) return false
    
    return Object.values(permissions.accounts).some(account => 
      account.displayLink.toLowerCase() === displayLink.toLowerCase()
    )
  }

  /**
   * Get creator access details
   */
  static getCreatorAccess(displayLink: string): UserAccount | null {
    const permissions = this.getPermissions()
    if (!permissions || !permissions.accounts) return null
    
    return Object.values(permissions.accounts).find(account => 
      account.displayLink.toLowerCase() === displayLink.toLowerCase()
    ) || null
  }

  /**
   * Clear all stored credentials
   */
  static clearCredentials(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  /**
   * Logout user with API call
   */
  static async logoutWithAPI(): Promise<LogoutResult> {
    const token = this.getAccessToken()
    
    try {
      console.log('🔐 [UserAuth] Calling logout API...')
      
      if (token) {
        const response = await axios.post('/api/auth/wallet/logout', {}, {
          headers: { 
            USER_AUTHORIZATION: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('✅ [UserAuth] Logout API successful')
        console.log('🔐 [UserAuth] Logout response:', response.data)
        
        // Clear local credentials after successful API logout
        this.clearCredentials()
        
        return response.data
      } else {
        console.log('⚠️ [UserAuth] No token found, clearing local credentials only')
        this.clearCredentials()
        
        return {
          success: true,
          message: 'Logged out locally (no active session)',
          logoutType: 'local_only'
        }
      }
    } catch (error: any) {
      console.error('❌ [UserAuth] Logout API failed')
      console.error('🔐 [UserAuth] Logout error:', error.response?.data || error)
      
      // Even if API fails, clear local credentials
      this.clearCredentials()
      
      return {
        success: false,
        message: error.response?.data?.error || 'Logout failed, but cleared local session',
        logoutType: 'forced_local'
      }
    }
  }

  /**
   * Logout user (updated to call API version)
   */
  static async logout(): Promise<LogoutResult> {
    return this.logoutWithAPI()
  }

  /**
   * Auto-refresh token if needed (updated to use silent validation)
   */
  static async ensureValidToken(): Promise<boolean> {
    const authState = this.getAuthState()
    
    if (!authState.isAuthenticated) {
      return false
    }
    
    // If token expires in less than 5 minutes, validate it
    const expiresIn = authState.expiresAt ? 
      new Date(authState.expiresAt).getTime() - Date.now() : 0
    
    if (expiresIn < 5 * 60 * 1000) { // 5 minutes
      const validation = await this.validateTokenSilent() // Use silent version
      if (!validation?.valid) {
        this.clearCredentials() // Only clear if we're sure it's invalid
        return false
      }
    }
    
    return true
  }

  /**
   * Clear corrupted or invalid credentials
   */
  static clearCorruptedCredentials(): void {
    const permissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS)
    
    // Check for common corruption patterns
    if (permissions === 'undefined' || permissions === 'null') {
      console.log('🔧 [UserAuth] Clearing corrupted permissions data')
      localStorage.removeItem(STORAGE_KEYS.PERMISSIONS)
    }
    
    // Try to parse and validate
    if (permissions) {
      try {
        const parsed = JSON.parse(permissions)
        if (!parsed || typeof parsed !== 'object') {
          localStorage.removeItem(STORAGE_KEYS.PERMISSIONS)
        }
      } catch (error) {
        console.log('🔧 [UserAuth] Clearing unparseable permissions')
        localStorage.removeItem(STORAGE_KEYS.PERMISSIONS)
      }
    }
  }
}

// Export convenience functions
export const userAuth = UserAuthService
