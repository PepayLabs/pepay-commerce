import React from 'react';
import { Box } from '@mui/material';

interface ContentPaymentIframeProps {
  paymentUrl: string;
}

export default function ContentPaymentIframe({ paymentUrl }: ContentPaymentIframeProps) {
  const formatPaymentUrl = (url: string): string => {
    if (url.includes('localhost') && !url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    if (url.includes('localhost') && url.startsWith('https://')) {
      return url.replace('https://', 'http://');
    }
    return url;
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
      //   backdropFilter: 'blur(24px)',
      //   WebkitBackdropFilter: 'blur(24px)',
      //   background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      //   boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      //   border: '1px solid rgba(255, 255, 255, 0.25)',
      }}
    >
      <Box
        component="iframe"
        src={formatPaymentUrl(paymentUrl)}
        sx={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: 'transparent',
        }}
      />
    </Box>
  );
}