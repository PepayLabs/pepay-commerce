export interface User {
    account_id: string
    email: string
    display_name: string
    display_link: string
    account_type: string
    is_verified: boolean
}

interface TokenData {
    access_token: string
    refresh_token: string
    token_expires_in: string
}

export const auth = {
    setTokens: (tokenData: TokenData) => {
        localStorage.setItem('access_token', tokenData.access_token)
        localStorage.setItem('refresh_token', tokenData.refresh_token)
        localStorage.setItem('token_expires_in', tokenData.token_expires_in)
        
        // Calculate actual expiration time (2h = 2 * 60 * 60 * 1000 ms)
        const expirationTime = new Date().getTime() + (2 * 60 * 60 * 1000)
        localStorage.setItem('token_expiration', expirationTime.toString())
    },

    getAccessToken: () => {
        const token = localStorage.getItem('access_token')
        const expiration = localStorage.getItem('token_expiration')

        if (!token || !expiration) {
            return null
        }

        // Validate token format (JWT should have 3 parts separated by dots)
        if (typeof token !== 'string' || token.split('.').length !== 3) {
            console.error('Malformed token detected, clearing auth')
            auth.logout()
            return null
        }

        // Check if token expires within 10 minutes (proactive refresh)
        const tenMinutes = 10 * 60 * 1000
        if (new Date().getTime() > (parseInt(expiration) - tenMinutes)) {
            // Token is expiring soon, should refresh
            return token // Still return current token, but caller should refresh
        }

        return token
    },

    getRefreshToken: () => {
        return localStorage.getItem('refresh_token')
    },

    isTokenExpiringSoon: () => {
        const expiration = localStorage.getItem('token_expiration')
        if (!expiration) return false
        
        const tenMinutes = 10 * 60 * 1000
        return new Date().getTime() > (parseInt(expiration) - tenMinutes)
    },

    isTokenExpired: () => {
        const expiration = localStorage.getItem('token_expiration')
        if (!expiration) return true
        
        return new Date().getTime() > parseInt(expiration)
    },

    refreshTokens: async (): Promise<boolean> => {
        const refreshToken = auth.getRefreshToken()
        if (!refreshToken) {
            console.error('No refresh token available')
            auth.logout()
            auth.redirectToLogin()
            return false
        }

        try {
            const response = await fetch('http://localhost:3000/api/accounts/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })

            if (!response.ok) {
                throw new Error(`Token refresh failed: ${response.status}`)
            }

            const data = await response.json()
            auth.setTokens(data)
            console.log('Tokens refreshed successfully')
            return true
        } catch (error) {
            console.error('Token refresh failed:', error)
            auth.logout()
            auth.redirectToLogin()
            return false
        }
    },

    setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user))
    },

    getUser: (): User | null => {
        try {
            const user = localStorage.getItem('user')
            if (!user) return null
            return JSON.parse(user)
        } catch (error) {
            console.error('Error parsing user data:', error)
            return null
        }
    },

    logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('token_expires_in')
        localStorage.removeItem('token_expiration')
        localStorage.removeItem('user')
        console.log('User logged out, tokens cleared')
    },

    redirectToLogin: () => {
        console.log('Redirecting to login due to auth failure')
        // Use replace to prevent back button issues
        window.location.replace('/')
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('access_token')
        return !!token && !auth.isTokenExpired()
    },

    // API helper that handles token refresh automatically
    apiCall: async (url: string, options: RequestInit = {}): Promise<Response> => {
        let accessToken = auth.getAccessToken()
        
        // If no valid token, logout and redirect
        if (!accessToken) {
            console.error('No valid access token available')
            auth.logout()
            auth.redirectToLogin()
            throw new Error('Authentication required')
        }
        
        // Proactive refresh if token is expiring soon
        if (auth.isTokenExpiringSoon()) {
            console.log('Token expiring soon, refreshing proactively')
            const refreshed = await auth.refreshTokens()
            if (!refreshed) {
                throw new Error('Token refresh failed')
            }
            accessToken = auth.getAccessToken()
        }

        // Add authorization header
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
        }

        let response = await fetch(url, { ...options, headers })

        // Reactive refresh on 401 TOKEN_EXPIRED
        if (response.status === 401) {
            console.log('Received 401, attempting token refresh')
            const refreshed = await auth.refreshTokens()
            if (refreshed) {
                // Retry the original request with new token
                const newToken = auth.getAccessToken()
                if (newToken) {
                    const newHeaders = {
                        'Content-Type': 'application/json',
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`,
                    }
                    response = await fetch(url, { ...options, headers: newHeaders })
                }
            } else {
                // Refresh failed, redirect handled in refreshTokens
                throw new Error('Authentication failed')
            }
        }

        return response
    }
} 