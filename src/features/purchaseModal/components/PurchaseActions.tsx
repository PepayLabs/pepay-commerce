import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SecurityIcon from '@mui/icons-material/Security';
import { PurchaseActionsProps } from '../types/purchase.types';

export default function PurchaseActions({
  content,
  isAuthenticated,
  onPurchase,
  onSignIn,
  textColor,
  loading = false,
}: PurchaseActionsProps) {
  const theme = useTheme();

  // Use white text since background is dark
  const actualTextColor = '#ffffff';
  const subtleTextColor = 'rgba(255, 255, 255, 0.7)';

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      {/* Price Display */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
            fontSize: { xs: '2.5rem', md: '3rem' },
            mb: 1,
            textShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        >
          ${content.price}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: subtleTextColor,
            fontSize: '0.875rem',
            fontWeight: 400,
          }}
        >
          One-time purchase • Instant access
        </Typography>
      </Box>

      {/* Buy Button - Identical for both auth states */}
      <Button
        variant="contained"
        size="large"
        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <ShoppingCartIcon />}
        onClick={onPurchase}
        disabled={loading}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
          fontSize: '1.1rem',
          py: 2,
          px: 4,
          borderRadius: '25px',
          textTransform: 'none',
          width: '100%',
          maxWidth: 300,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          },
          '&:disabled': {
            bgcolor: theme.palette.primary.main,
            opacity: 0.7,
          },
          transition: 'all 0.3s ease',
        }}
      >
        {loading ? 'Processing...' : `Buy Now - $${content.price}`}
      </Button>

      {/* Security Note - Same for both states */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
        <SecurityIcon sx={{ fontSize: 16, color: subtleTextColor }} />
        <Typography
          variant="caption"
          sx={{
            color: subtleTextColor,
            fontSize: '0.75rem',
            fontWeight: 400,
          }}
        >
          Secure wallet payment • Decentralized
        </Typography>
      </Box>
    </Box>
  );
}