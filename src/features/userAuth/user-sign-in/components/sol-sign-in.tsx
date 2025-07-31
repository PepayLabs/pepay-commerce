import { useState } from 'react'
import { Stack, Typography, Button, Box } from '@mui/material'
import { 
  AccountBalanceWallet as WalletIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { toast } from 'sonner'

type SolanaAuthStep = 'connect' | 'sign' | 'authenticated'

interface SolanaSignInProps {
  onSuccess: () => void
  onReset: () => void
}

export default function SolanaSignIn({ onSuccess, onReset }: SolanaSignInProps) {
  const [authStep, setAuthStep] = useState<SolanaAuthStep>('connect')
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')

  const handleWalletConnect = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement Solana wallet connection
      // For now, simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock Solana address
      const mockAddress = 'DaB12345678901234567890123456789012345678901'
      
      setWalletAddress(mockAddress)
      setAuthStep('sign')
      toast.success('Solana wallet connected!')
    } catch (error) {
      toast.error('Failed to connect Solana wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSign = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement Solana message signing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setAuthStep('authenticated')
      toast.success('Successfully authenticated with Solana wallet!')
      
      // Call success callback after showing success state
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      toast.error('Solana authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (authStep === 'connect') {
    return (
      <Stack spacing={3} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <WalletIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Connect Solana Wallet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Connect your Phantom, Solflare, or Backpack wallet
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(147, 51, 234, 0.08)', 
            borderRadius: 2,
            border: '1px solid rgba(147, 51, 234, 0.2)'
          }}>
            <Typography variant="body2" color="text.secondary">
              ⚡ Make sure your Solana wallet is unlocked and ready
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleWalletConnect}
          disabled={isLoading}
          sx={{ 
            py: 1.5,
            background: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
            }
          }}
        >
          {isLoading ? 'Connecting...' : 'Connect Solana Wallet'}
        </Button>

        <Button
          variant="text"
          onClick={onReset}
          sx={{ color: 'text.secondary' }}
        >
          Choose Different Wallet
        </Button>
      </Stack>
    )
  }

  if (authStep === 'sign') {
    return (
      <Stack spacing={3} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Sign Solana Message
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign a message to prove wallet ownership
          </Typography>
          
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'grey.50', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {walletAddress}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSign}
          disabled={isLoading}
          sx={{ 
            py: 1.5,
            background: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
            }
          }}
        >
          {isLoading ? 'Signing...' : 'Sign Message'}
        </Button>

        <Button
          variant="text"
          onClick={onReset}
          sx={{ color: 'text.secondary' }}
        >
          Start Over
        </Button>
      </Stack>
    )
  }

  if (authStep === 'authenticated') {
    return (
      <Stack spacing={3} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <CheckIcon 
            sx={{ 
              fontSize: 48, 
              color: 'success.main', 
              mb: 2,
              p: 1,
              backgroundColor: 'rgba(52, 199, 89, 0.1)',
              borderRadius: '50%'
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
            Solana Authentication Successful!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting you to exclusive content...
          </Typography>
        </Box>
      </Stack>
    )
  }

  return null
}
