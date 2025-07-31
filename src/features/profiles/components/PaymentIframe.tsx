import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContrastColors } from '../hooks/useContrastColors';

interface PaymentIframeProps {
  paymentUrl: string;
  supportTitle: string;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
  onBack: () => void;
}

export default function PaymentIframe({ 
  paymentUrl, 
  supportTitle, 
  backgroundColor, 
  backgroundImageUrl, 
  textColor = null,
  onBack 
}: PaymentIframeProps) {
  const theme = useTheme();
  const { textColor: calculatedTextColor, uiBackgroundColor, uiBorderColor } = 
    useContrastColors(backgroundColor, backgroundImageUrl);

  const finalTextColor = textColor || calculatedTextColor;

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
    <Box sx={{ 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      backgroundColor: uiBackgroundColor,
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${uiBorderColor}`,
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 3,
      mb: 4,
    }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={600} color={finalTextColor} mb={2}>
        {supportTitle}
      </Typography>
      
      {/* Back Button */}
      <Button onClick={onBack} sx={{ mb: 2, color: finalTextColor }}>
        ← Change Amount
      </Button>
      
      {/* Payment Iframe */}
      <Box
        component="iframe"
        src={formatPaymentUrl(paymentUrl)}
        sx={{
          width: '100%',
          height: '500px',
          border: 'none',
          borderRadius: theme.shape.borderRadius,
        }}
      />
    </Box>
  );
}