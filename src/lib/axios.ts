import axios from 'axios'
import { auth } from '@/lib/auth'
import { userAuth } from '@/lib/userAuth'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
axiosInstance.interceptors.request.use(async (config) => {
  // Skip adding Authorization if USER_AUTHORIZATION is already present
  if (config.headers && config.headers['USER_AUTHORIZATION']) {
    console.log('🔒 Skipping Authorization header - using USER_AUTHORIZATION instead')
    return config
  }
  
  // Check for wallet authentication first (USER_AUTHORIZATION)
  const walletToken = userAuth.getAccessToken()
  if (walletToken) {
    config.headers['USER_AUTHORIZATION'] = `Bearer ${walletToken}`
    return config
  }
  
  // Fall back to regular authentication (Authorization)
  const regularToken = await auth.getAccessToken()
  if (regularToken) {
    config.headers.Authorization = `Bearer ${regularToken}`
  }
  
  return config
})

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log the error for debugging
    console.log('🔴 Axios Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: originalRequest?.url,
      method: originalRequest?.method,
      hasRetryFlag: !!originalRequest._retry
    })

    // Check if it's a 401 error and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      console.log('🔄 401 detected, attempting token refresh...')
      
      // Check if this was a wallet authentication request
      const isWalletAuth = originalRequest.headers?.['USER_AUTHORIZATION']
      
      if (isWalletAuth) {
        // For wallet auth, we don't have refresh tokens yet
        // Just clear credentials and reject
        console.log('🚪 Wallet authentication failed, clearing credentials')
        userAuth.clearCredentials()
        return Promise.reject(error)
      } else {
        // For regular auth, try to refresh
        try {
          const refreshed = await auth.refreshTokens()
          if (refreshed) {
            console.log('✅ Token refresh successful, retrying request...')
            // Update the original request with new token
            const newToken = auth.getAccessToken()
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              // Retry the original request
              return axiosInstance(originalRequest)
            }
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError)
        }
        
        // If refresh failed, logout and redirect
        console.log('🚪 Authentication failed, redirecting to login')
        auth.logout()
        auth.redirectToLogin()
        return Promise.reject(error)
      }
    }

    // For 400 errors, let's log the details to help debug
    if (error.response?.status === 400) {
      console.log('🔍 400 Bad Request Details:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: originalRequest?.data,
        headers: originalRequest?.headers,
        responseData: error.response?.data
      })
    }

    // For other errors, reject as normal
    return Promise.reject(error)
  }
)