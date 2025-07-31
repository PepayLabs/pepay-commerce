import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  Alert,
  AlertTitle,
} from '@mui/material'
import WalletSelection from './components/wallet-selection'
import EVMSignIn from './components/evm-sign-in'
import SolanaSignIn from './components/sol-sign-in'
import SocialMediaFooter from './components/social-media-footer'

// Apple-inspired theme with premium aesthetics
const premiumTheme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
      dark: '#0056CC',
    },
    secondary: {
      main: '#5AC8FA',
    },
    background: {
      default: '#F2F2F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1C1E',
      secondary: '#8E8E93',
    },
    success: {
      main: '#34C759',
    },
    warning: {
      main: '#FF9500',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0056CC 0%, #007AFF 100%)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
})

type WalletType = 'evm' | 'solana' | null

export default function UserSignIn() {
  const navigate = useNavigate()
  const [selectedWallet, setSelectedWallet] = useState<WalletType>(null)

  const handleWalletSelect = (walletType: 'evm' | 'solana') => {
    setSelectedWallet(walletType)
  }

  const handleAuthSuccess = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('redirect');
    
    if (redirectPath && redirectPath !== '/user-sign-in') {
      navigate({ to: redirectPath as any });
    } else {
      navigate({ to: '/home' });
    }
  }

  const handleReset = () => {
    setSelectedWallet(null)
  }

  const renderWalletFlow = () => {
    if (!selectedWallet) {
      return <WalletSelection onWalletSelect={handleWalletSelect} />
    }

    if (selectedWallet === 'evm') {
      return (
        <EVMSignIn 
          onSuccess={handleAuthSuccess} 
          onReset={handleReset} 
        />
      )
    }

    if (selectedWallet === 'solana') {
      return (
        <SolanaSignIn 
          onSuccess={handleAuthSuccess} 
          onReset={handleReset} 
        />
      )
    }

    return null
  }

  return (
    <ThemeProvider theme={premiumTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <img
                  src="/images/gmas-app-square.png"
                  alt="Grab Me A Slice Logo"
                  style={{ height: 48, marginRight: 12 }}
                />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Grab Me A Slice
                </Typography>
              </Box>
              
              <Typography variant="h4" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                Connect Your Wallet
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Access exclusive content from your favorite creators
              </Typography>

              <Alert 
                severity="info" 
                sx={{ 
                  textAlign: 'left',
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 122, 255, 0.08)',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  '& .MuiAlert-icon': {
                    color: 'primary.main'
                  }
                }}
              >
                <AlertTitle sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  First Time Here?
                </AlertTitle>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Connect with the same wallet you used for donations or subscriptions to access premium content.
                </Typography>
              </Alert>
            </Box>

            {/* Wallet Flow */}
            {renderWalletFlow()}

            {/* Footer */}
            <SocialMediaFooter />
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  )
}
