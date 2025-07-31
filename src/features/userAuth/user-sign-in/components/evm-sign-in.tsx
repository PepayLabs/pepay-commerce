import { useState, useEffect } from 'react'
import { Stack, Typography, Button, Box } from '@mui/material'
import { 
  Security as SecurityIcon,
  Check as CheckIcon,
} from '@mui/icons-material'
import { useSignMessage, useAccount, useChainId } from 'wagmi'
import { toast } from 'sonner'
import EVMConnectButton from './evm-connect-button'
import { useAppKit } from '@reown/appkit/react'
import { userAuth } from '@/lib/userAuth'

type EVMAuthStep = 'connect' | 'sign' | 'authenticated'

interface EVMSignInProps {
  onSuccess: (result: any) => void
  onReset: () => void
}

export default function EVMSignIn({ onSuccess, onReset }: EVMSignInProps) {
  const [authStep, setAuthStep] = useState<EVMAuthStep>('connect')
  const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string>('')
  
  const { isConnected, address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  // Auto-advance to sign step when wallet connects
  useEffect(() => {
    if (isConnected && address && authStep === 'connect') {
      setWalletAddress(address)
      setAuthStep('sign')
    }
  }, [isConnected, address, authStep])

  const handleConnectionSuccess = (address: string) => {
    setWalletAddress(address)
    setAuthStep('sign')
  }

  const handleConnectionError = (error: string) => {
    toast.error(error)
  }

  const handleSign = async () => {
    if (!address) {
      toast.error('No wallet address found')
      return
    }
    
    setIsLoading(true)
    try {
      const signFunction = async (message: string) => {
        const signature = await signMessageAsync({ message })
        return signature
      }
      
      const result = await userAuth.authenticateEVM(address, signFunction)
      
      console.log('Authentication successful:', result)
      setAuthStep('authenticated')
      onSuccess?.(result)
    } catch (error) {
      console.error('Authentication failed:', error)
      toast.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (authStep === 'connect') {
    return (
      <Stack spacing={3} alignItems="center">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Connect EVM Wallet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use the familiar Web3Modal to connect your wallet
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(0, 122, 255, 0.08)', 
            borderRadius: 2,
            border: '1px solid rgba(0, 122, 255, 0.2)'
          }}>
            <Typography variant="body2" color="text.secondary">
              💡 Connect the same wallet you used for donations
            </Typography>
          </Box>
        </Box>

        <EVMConnectButton
          onConnectionSuccess={handleConnectionSuccess}
          onConnectionError={handleConnectionError}
        />

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
            Sign EVM Message
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
          sx={{ py: 1.5 }}
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
            EVM Authentication Successful!
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
