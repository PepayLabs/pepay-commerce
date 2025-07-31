import { Stack, Typography, Button, Box, Chip } from '@mui/material'
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material'

type WalletType = 'evm' | 'solana'

interface WalletSelectionProps {
  onWalletSelect: (walletType: WalletType) => void
}

export default function WalletSelection({ onWalletSelect }: WalletSelectionProps) {
  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 600 }}>
        Choose Your Blockchain
      </Typography>
      
      <Stack spacing={2}>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={() => onWalletSelect('evm')}
          startIcon={<WalletIcon />}
          endIcon={<Chip label="Popular" size="small" color="primary" />}
          sx={{
            py: 2,
            justifyContent: 'space-between',
            '& .MuiChip-root': {
              ml: 'auto'
            }
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Ethereum, BNB, & EVM
            </Typography>
            <Typography variant="body2" color="text.secondary">
              MetaMask, WalletConnect, Coinbase
            </Typography>
          </Box>
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={() => onWalletSelect('solana')}
          startIcon={<WalletIcon />}
          sx={{
            py: 2,
            justifyContent: 'flex-start',
          }}
        >
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Solana
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phantom, Solflare, Backpack
            </Typography>
          </Box>
        </Button>
      </Stack>
    </Stack>
  )
}
