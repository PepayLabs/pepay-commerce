import React from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

interface PaymentHeaderProps {
  contentTitle: string;
  contentPrice: number;
  onBack: () => void;
  onClose: () => void;
}

export default function PaymentHeader({ 
  contentTitle, 
  contentPrice, 
  onBack, 
  onClose 
}: PaymentHeaderProps) {
  return (
    <Box sx={{ 
      p: 3, 
      background: 'rgba(255, 255, 255, 0.1)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Left side - Logo and Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <img 
          src="/images/gmas-app-square.png" 
          alt="Logo" 
          style={{ height: '32px', width: 'auto' }}
        />
        
        <Button 
          onClick={onBack} 
          startIcon={<ArrowBackIcon />}
          sx={{ 
            color: 'white',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Back
        </Button>
      </Box>

      {/* Center - Payment info */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ 
          color: 'white', 
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 1.2
        }}>
          Complete Payment
        </Typography>
        <Typography sx={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '13px',
          fontWeight: 400
        }}>
          {contentTitle} • ${contentPrice}
        </Typography>
      </Box>

      {/* Right side - Close button */}
      <IconButton onClick={onClose} sx={{ color: 'white' }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}