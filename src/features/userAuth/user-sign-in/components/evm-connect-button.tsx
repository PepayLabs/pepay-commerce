import { Button, Box, Typography } from '@mui/material'
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material'
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi'

interface EVMConnectButtonProps {
  onConnectionSuccess: (address: string) => void
  onConnectionError: (error: string) => void
  isLoading?: boolean
}

export default function EVMConnectButton({ 
  onConnectionSuccess, 
  onConnectionError,
  isLoading = false 
}: EVMConnectButtonProps) {
  const { open } = useAppKit()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  const handleClick = () => {
    if (isConnected) {
      disconnect()
    } else {
      open()
    }
  }

  // Trigger success callback when connected
  if (isConnected && address) {
    onConnectionSuccess(address)
  }

  if (isConnected && address) {
    return (
      <Button
        variant="outlined"
        size="large"
        fullWidth
        onClick={handleClick}
        startIcon={<WalletIcon />}
        sx={{ py: 1.5 }}
      >
        <Box sx={{ textAlign: 'left', flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Connected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </Typography>
        </Box>
      </Button>
    )
  }

  return (
    <Button
      variant="contained"
      size="large"
      fullWidth
      onClick={handleClick}
      disabled={isLoading}
      startIcon={<WalletIcon />}
      sx={{ py: 1.5 }}
    >
      Connect EVM Wallet
    </Button>
  )
}