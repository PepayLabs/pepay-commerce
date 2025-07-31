import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  InputAdornment,
  Tooltip,
  Alert,
  Badge
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContrastColors } from '../hooks/useContrastColors';
import { useSubscription } from '../hooks/useProfile';
import { useDonationWebSocket } from '../hooks/useDonationWebSocket';
import { SubscriptionRequest } from '../types/profile.types';
import PaymentIframe from './PaymentIframe';
import {
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

interface ProfileSubscriptionProps {
  displayLink: string;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  supportTitle?: string;
  supportMessage?: string;
  subscriptionMonthlyPrice?: number;
  subscriptionQuarterlyPrice?: number;
  subscriptionYearlyPrice?: number;
  isVerified?: boolean;
  textColor?: string | null;
  supportImage?: number;
}

interface SubscriptionTier {
  id: string;
  name: string;
  duration: string;
  price: number;
  savings?: number;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
  description: string;
}

const getImagePath = (imageNumber: number): string => {
  const imageMap: { [key: number]: string } = {
    1: '/images/pizza1.png',
    2: '/images/pills.png', 
    3: '/images/cash.png',
    4: '/images/chips.png',
    5: '/images/blunts.png',
    6: '/images/candle.png',
    7: '/images/hat.png'
  };
  return imageMap[imageNumber] || '/images/pizza.png';
};

export default function ProfileSubscription({ 
  displayLink,
  backgroundColor = null, 
  backgroundImageUrl = null,
  supportTitle = "Join My Community",
  supportMessage = "Subscribe to get exclusive access to my content and join our community",
  subscriptionMonthlyPrice = 10,
  subscriptionQuarterlyPrice = 27,
  subscriptionYearlyPrice = 80,
  isVerified = false,
  textColor = null,
  supportImage = 1
}: ProfileSubscriptionProps) {
  const theme = useTheme();
  const { submitSubscription, subscriptionLoading, subscriptionError } = useSubscription();
  const { isConnected, donationComplete, connectionAttempts, connectToPayment } = useDonationWebSocket();
  const [selectedTier, setSelectedTier] = useState<string>('quarterly');
  const [userMessage, setUserMessage] = useState('');
  const [subscriberName, setSubscriberName] = useState('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Get appropriate colors based on background
  const { subtleTextColor, uiElementColor, uiBorderColor, uiBackgroundColor } = 
    useContrastColors(backgroundColor, backgroundImageUrl);

  // Calculate savings percentages
  const monthlySavings = Math.round((1 - (subscriptionQuarterlyPrice / 3) / subscriptionMonthlyPrice) * 100);
  const yearlySavings = Math.round((1 - (subscriptionYearlyPrice / 12) / subscriptionMonthlyPrice) * 100);

  // Subscription tiers with dynamic pricing
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      duration: '1 month',
      price: subscriptionMonthlyPrice,
      icon: <Clock className="w-5 h-5" />,
      color: '#6366f1',
      description: 'Perfect to start'
    },
    {
      id: 'quarterly', 
      name: 'Quarterly',
      duration: '3 months',
      price: subscriptionQuarterlyPrice,
      savings: monthlySavings,
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#8b5cf6',
      popular: true,
      description: 'Most popular choice'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      duration: '12 months', 
      price: subscriptionYearlyPrice,
      savings: yearlySavings,
      icon: <Crown className="w-5 h-5" />,
      color: '#f59e0b',
      description: 'Best value, save the most'
    }
  ];

  const selectedTierData = subscriptionTiers.find(tier => tier.id === selectedTier)!;

  // Map subscription tiers to months
  const getSubscriptionMonths = (tierId: string): number => {
    switch (tierId) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'yearly': return 12;
      default: return 1;
    }
  };

  const handleSubscribe = async () => {
    const subscriptionData: SubscriptionRequest = {
      subscription_months: getSubscriptionMonths(selectedTier),
      subscriberName: subscriberName || 'Anonymous',
      subscriberMessage: userMessage || undefined,
      subscriberEmail: undefined, // We can add email input later if needed
      socialPlatform: null // We can add social platform selection later if needed
    };

    console.log('🔄 Submitting subscription:', subscriptionData);

    const response = await submitSubscription(displayLink, subscriptionData);
    
    if (response) {
      console.log('🎉 Subscription Payment URL:', response.payment_url);
      console.log('📋 Full subscription response:', response);
      
      // Set payment URL to show iframe
      setPaymentUrl(response.payment_url);
      
      // Connect to WebSocket to track payment (same as donations)
      console.log('🔌 Establishing WebSocket connection for subscription...');
      connectToPayment(response.invoice_id, response.ws_signature);
    }
  };

  if (paymentUrl) {
    return (
      <PaymentIframe 
        paymentUrl={paymentUrl}
        supportTitle={supportTitle}
        backgroundColor={backgroundColor}
        backgroundImageUrl={backgroundImageUrl}
        textColor={textColor}
        onBack={() => setPaymentUrl(null)}
      />
    );
  }
  
  return (
    <Box sx={{ 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(50px)',
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      borderRadius: '36px',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 3,
      position: 'relative'
    }}>
      {/* Header with Title and Verified Badge */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography 
          variant="h4" 
          fontWeight={600}
          color={textColor}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Box
            component="img"
            src={getImagePath(supportImage)}
            alt="Support"
            sx={{ 
              width: 48,
              height: 48,
              borderRadius: '12px',
              padding: '2px',
             // backgroundColor: 'rgba(255, 255, 255, 0.0001)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 40px rgba(31, 38, 135, 0.4)',
              }
            }}
          />
          {supportTitle}
        </Typography>
        
        {isVerified && (
          <Tooltip title="Profile Verified" arrow>
            <Box 
              sx={{ 
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 4px 16px rgba(31, 38, 135, 0.2)',
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              <Box
                component="img"
                src="/images/verified.png"
                alt="Verified"
                sx={{ width: 18, height: 18 }} 
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: textColor || 'white',
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  fontSize: '12px'
                }}
              >
                Verified
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>
      
      <Typography variant="body2" color={textColor || subtleTextColor} mb={3}>
        {supportMessage}
      </Typography>
      
      {/* Subscriber Name Input - More Compact */}
      <TextField
        fullWidth
        value={subscriberName}
        onChange={(e) => setSubscriberName(e.target.value)}
        placeholder="Your name"
        size="small"
        sx={{
          mb: 1.5,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: textColor || subtleTextColor,
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
              }
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: uiBorderColor,
          },
          '& .MuiInputBase-input::placeholder': {
            color: textColor || 'rgba(255, 255, 255, 0.7)',
            opacity: 0.6,
            fontStyle: 'italic',
            fontWeight: 400,
          },
        }}
      />
      
      {/* Message Input - More Compact */}
      <TextField
        fullWidth
        multiline
        rows={2}
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Spread some good vibes! (optional)"
        size="small"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: textColor,
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '& fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '2px',
              }
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: uiBorderColor,
          },
          '& .MuiInputBase-input::placeholder': {
            color: textColor || 'rgba(255, 255, 255, 0.7)',
            opacity: 0.6,
            fontStyle: 'italic',
            fontWeight: 400,
          },
        }}
      />

      {/* Powered by Pepay */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mb: 3,
          gap: 0.5,
          cursor: 'pointer',
          borderRadius: '8px',
          p: 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.02)',
          }
        }}
        onClick={() => window.open('https://pepay.io', '_blank')}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: textColor || subtleTextColor,
            fontSize: '12px',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: theme.palette.primary.main,
            }
          }}
        >
          Powered by{' '}
          <Box 
            component="span" 
            sx={{ 
              fontWeight: 'bold',
              color: textColor,
              transition: 'color 0.2s ease',
              '&:hover': {
                color: theme.palette.primary.main,
              }
            }}
          >
            Pepay
          </Box>
        </Typography>
        <Box
          component="img"
          src="/images/logo-update.PNG"
          alt="Pepay Logo"
          sx={{
            width: 16,
            height: 16,
            ml: 0.5,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        />
      </Box>

      {/* Subscription Tiers - More Compact Version */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {subscriptionTiers.map((tier) => (
          <Box
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            sx={{
              position: 'relative',
              p: 2,
              borderRadius: '16px',
              border: selectedTier === tier.id 
                ? `2px solid ${tier.color}`
                : '1px solid rgba(255, 255, 255, 0.2)',
              background: selectedTier === tier.id
                ? `linear-gradient(135deg, ${tier.color}15, ${tier.color}08)`
                : 'rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: selectedTier === tier.id ? 'scale(1.01)' : 'scale(1)',
              '&:hover': {
                transform: 'scale(1.01)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: `1px solid ${tier.color}60`,
              }
            }}
          >
            {tier.popular && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: 12,
                  backgroundColor: tier.color,
                  color: 'white',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}
              >
                Popular
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${tier.color}, ${tier.color}80)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <Box sx={{ transform: 'scale(0.8)' }}>
                    {tier.icon}
                  </Box>
                </Box>
                
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: textColor || 'white',
                      fontWeight: 600,
                      mb: 0.25,
                      fontSize: '16px'
                    }}
                  >
                    {tier.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: textColor || subtleTextColor,
                      opacity: 0.7,
                      fontSize: '11px'
                    }}
                  >
                    {tier.description}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: textColor || 'white',
                    fontWeight: 700,
                    mb: 0.25,
                    fontSize: '18px'
                  }}
                >
                  ${tier.price}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: textColor || subtleTextColor,
                    opacity: 0.7,
                    fontSize: '10px'
                  }}
                >
                  {tier.duration}
                </Typography>
                {tier.savings && tier.savings > 0 && (
                  <Box
                    sx={{
                      mt: 0.25,
                      px: 0.75,
                      py: 0.125,
                      borderRadius: '6px',
                      backgroundColor: '#10b981',
                      display: 'inline-block'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '9px'
                      }}
                    >
                      SAVE {tier.savings}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* WebSocket Connection Status */}
      {isConnected && (
        <Alert 
          severity="info" 
          sx={{ mb: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)' }}
        >
          🔌 Tracking payment status... (Connected)
        </Alert>
      )}

      {connectionAttempts > 0 && !isConnected && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)' }}
        >
          🔄 Reconnecting... (Attempt {connectionAttempts}/5)
        </Alert>
      )}

      {donationComplete && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
        >
          🎉 Subscription activated! Welcome {donationComplete.donor_name}!
        </Alert>
      )}
      
      {/* Subscribe Button */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSubscribe}
        disabled={subscriptionLoading}
        sx={{
          background: `linear-gradient(135deg, ${selectedTierData.color}, ${selectedTierData.color}cc)`,
          color: 'white',
          fontWeight: 700,
          py: 2,
          borderRadius: '25px',
          fontSize: '18px',
          textTransform: 'none',
          boxShadow: `0 8px 25px ${selectedTierData.color}40`,
          '&:hover': {
            background: `linear-gradient(135deg, ${selectedTierData.color}dd, ${selectedTierData.color}aa)`,
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 35px ${selectedTierData.color}50`,
          },
          '&:disabled': {
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            color: subtleTextColor,
          },
          transition: 'all 0.3s ease'
        }}
      >
        {subscriptionLoading ? 'Processing...' : `Subscribe for $${selectedTierData.price}`}
      </Button>
      
      {subscriptionError && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {subscriptionError.message}
        </Typography>
      )}
    </Box>
  );
}
