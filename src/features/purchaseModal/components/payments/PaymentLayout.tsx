import React from 'react';
import { Box } from '@mui/material';
import ContentPreviewDesktop from '@/features/purchaseModal/components/ContentPreviewDesktop';
import ContentPaymentIframe from '@/features/purchaseModal/components/ContentPaymentIframe';
import { ContentItem, ContentAccount } from '../../../userContent/types/content.types';

interface PaymentLayoutProps {
  content: ContentItem;
  account: ContentAccount;
  paymentUrl: string;
  onPreviewClick?: () => void;
  textColor?: string;
  uiBackgroundColor?: string;
  uiBorderColor?: string;
}

export default function PaymentLayout({
  content,
  paymentUrl,
  onPreviewClick,
  textColor,
  uiBackgroundColor,
  uiBorderColor,
}: PaymentLayoutProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        minHeight: 0,
      }}
    >
      {/* Left Side - Content Preview (5.2/12 = 43.3%) */}
      <Box
        sx={{
          width: '43.3%', // 5.2/12 split
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.25)'}`,
          overflow: 'auto',
        }}
      >
        <ContentPreviewDesktop
          content={content}
          onPreviewClick={onPreviewClick}
          isPaymentMode={true}
          textColor={textColor}
          uiBackgroundColor={uiBackgroundColor}
          uiBorderColor={uiBorderColor}
        />
      </Box>

      {/* Right Side - Payment Iframe (6.8/12 = 56.7%) */}
      <Box
        sx={{
          width: '56.7%', // 6.8/12 split
          p: 2, // Minimal padding for iframe
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ContentPaymentIframe paymentUrl={paymentUrl} />
      </Box>
    </Box>
  );
}