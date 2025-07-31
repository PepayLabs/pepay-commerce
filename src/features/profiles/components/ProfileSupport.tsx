import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popper,
  Paper,
  InputAdornment,
  SvgIcon,
  Tooltip,
  Alert,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContrastColors } from '../hooks/useContrastColors';
import { useDonation } from '../hooks/useProfile';
import { useDonationWebSocket } from '../hooks/useDonationWebSocket';
import { DonationRequest } from '../types/profile.types';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import InfoIcon from '@mui/icons-material/Info';
import PaymentIframe from './PaymentIframe';
import ProfileSubscription from './ProfileSubscription';

interface ProfileSupportProps {
  displayLink: string;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  supportImage?: number;
  supportTitle?: string;
  supportMessage?: string;
  customDonationAmount1?: number;
  customDonationAmount2?: number;
  customDonationAmount3?: number;
  paymentModel?: 'donations' | 'subscriptions';
  subscriptionMonthlyPrice?: number;
  subscriptionQuarterlyPrice?: number;
  subscriptionYearlyPrice?: number;
  isVerified?: boolean;
  textColor?: string | null;
}

export default function ProfileSupport({ 
  displayLink,
  backgroundColor = null, 
  backgroundImageUrl = null,
  supportImage = 1,
  supportTitle = "Support My Work",
  supportMessage = "If you enjoy my content and want to support what I do, consider supporting me!",
  customDonationAmount1 = 5,
  customDonationAmount2 = 10,
  customDonationAmount3 = 25,
  paymentModel = 'donations',
  subscriptionMonthlyPrice = 10,
  subscriptionQuarterlyPrice = 27,
  subscriptionYearlyPrice = 80,
  isVerified = false,
  textColor = null
}: ProfileSupportProps) {
  const theme = useTheme();
  const { submitDonation, donationLoading, donationError } = useDonation();
  const { isConnected, donationComplete, connectionAttempts, connectToPayment } = useDonationWebSocket();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(customDonationAmount1);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [userMessage, setUserMessage] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  // Get appropriate colors based on background
  const { subtleTextColor, uiElementColor, uiBorderColor, uiBackgroundColor } = 
    useContrastColors(backgroundColor, backgroundImageUrl);
  
  // Custom SVG Icons
  const TikTokIcon = () => (
    <SvgIcon sx={{ color: '#000000', fontSize: '20px' }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.26z"/>
    </SvgIcon>
  );

  const TelegramIcon = () => (
    <SvgIcon sx={{ color: '#0088cc', fontSize: '20px' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
    </SvgIcon>
  );
  
  // Social media options with proper icons
  const socialOptions = [
    { 
      name: 'Twitter', 
      handle: '@twitter', 
      icon: <TwitterIcon sx={{ color: '#1DA1F2', fontSize: '20px' }} /> 
    },
    { 
      name: 'Instagram', 
      handle: '@instagram', 
      icon: <InstagramIcon sx={{ color: '#E1306C', fontSize: '20px' }} /> 
    },
    { 
      name: 'TikTok', 
      handle: '@tiktok', 
      icon: <TikTokIcon /> 
    },
    { 
      name: 'Telegram', 
      handle: '@telegram', 
      icon: <TelegramIcon /> 
    }
  ];

  // Image mapping
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

  const handlePresetAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const handleUserHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUserHandle(value);
    
    // If @ is removed, clear social selection and hide dropdown
    if (!value.includes('@')) {
      setSelectedSocial(null);
      setShowSocialDropdown(false);
    }
    // If user typed @ at the end and no social is selected, show dropdown
    else if (value.endsWith('@') && !selectedSocial) {
      setShowSocialDropdown(true);
    }
    // If @ exists but not at the end, or social is already selected, hide dropdown
    else {
      setShowSocialDropdown(false);
    }
  };

  const handleSocialSelect = (social: any) => {
    // Keep the @ and set the selected social
    setSelectedSocial(social);
    setShowSocialDropdown(false);
  };

  const handleSupport = async () => {
    const finalAmount = selectedAmount || parseFloat(customAmount);
    if (!finalAmount || finalAmount <= 0) return;

    // Parse donor name and social platform
    const parseDonorInfo = () => {
      if (!userHandle.includes('@')) {
        return {
          donorName: userHandle,
          socialPlatform: null
        };
      }
      
      const atIndex = userHandle.indexOf('@');
      return {
        donorName: userHandle.substring(atIndex + 1),
        socialPlatform: selectedSocial?.name.toLowerCase() || null
      };
    };

    const { donorName, socialPlatform } = parseDonorInfo();

    const donationData: DonationRequest = {
      amount: finalAmount,
      donorName: donorName || 'Anonymous',
      donorMessage: userMessage,
      donorEmail: '', // We'll add email input later if needed
      socialPlatform: socialPlatform as any
    };

    console.log('Submitting donation:', donationData);

    const response = await submitDonation(displayLink, donationData);
    
    if (response) {
      console.log('🎉 Payment URL:', response.payment_url);
      console.log('Full donation response:', response);
      
      // Set payment URL to show iframe
      setPaymentUrl(response.payment_url);
      
      // Connect to WebSocket to track payment
      console.log('🔌 Establishing WebSocket connection...');
      connectToPayment(response.invoice_id, response.ws_signature);
    }
  };

  // Simplified click outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the entire container
      if (!target.closest('[data-dropdown-container]')) {
        setShowSocialDropdown(false);
      }
    };

    if (showSocialDropdown) {
      // Add a small delay to prevent immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSocialDropdown]);

  const currentAmount = selectedAmount || parseFloat(customAmount) || 0;
  
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
  
  // Render subscription UI if payment model is subscriptions
  if (paymentModel === 'subscriptions') {
    return (
      <ProfileSubscription
        displayLink={displayLink}
        backgroundColor={backgroundColor}
        backgroundImageUrl={backgroundImageUrl}
        supportTitle={supportTitle}
        supportMessage={supportMessage}
        subscriptionMonthlyPrice={subscriptionMonthlyPrice}
        subscriptionQuarterlyPrice={subscriptionQuarterlyPrice}
        subscriptionYearlyPrice={subscriptionYearlyPrice}
        isVerified={isVerified}
        textColor={textColor}
      />
    );
  }
  
  return (
    <Box sx={{ 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(50px)',
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      borderRadius: '36px',
      border: '1 px solid rgba(255, 255, 255, 0.25)',
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
        >
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
                sx={{ 
                  width: 18,
                  height: 18
                }} 
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
      
      {/* Amount Selection Row */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: '3px', md: 1.5 },
        mb: 3,
        p: { xs: 1.5, md: 2 },
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '4px',
        border: `1px solid ${uiBorderColor}`,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      }}>
        {/* Support Image */}
        <Box 
          component="img" 
          src={getImagePath(supportImage)}
          alt="Support"
          sx={{ 
            width: { xs: 40, md: 50 }, 
            height: { xs: 40, md: 50 }, 
            borderRadius: '5%',
            mr: { xs: 1, md: 2 }
          }} 
        />
        
        {/* Amount Buttons */}
        <Button
          variant={selectedAmount === customDonationAmount1 ? "contained" : "outlined"}
          onClick={() => handlePresetAmountClick(customDonationAmount1)}
          sx={{
            minWidth: { xs: '45px', md: '60px' },
            height: { xs: '36px', md: '40px' },
            borderRadius: '20px',
            borderColor: uiBorderColor,
            color: selectedAmount === customDonationAmount1 ? 'white' : textColor,
            backgroundColor: selectedAmount === customDonationAmount1 ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
            fontSize: { xs: '14px', md: '16px' },
            fontWeight: 600,
            '&:hover': {
              backgroundColor: selectedAmount === customDonationAmount1 ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.15)',
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          ${customDonationAmount1}
        </Button>
        
        <Button
          variant={selectedAmount === customDonationAmount2 ? "contained" : "outlined"}
          onClick={() => handlePresetAmountClick(customDonationAmount2)}
          sx={{
            minWidth: { xs: '45px', md: '60px' },
            height: { xs: '36px', md: '40px' },
            borderRadius: '20px',
            borderColor: uiBorderColor,
            color: selectedAmount === customDonationAmount2 ? 'white' : textColor,
            backgroundColor: selectedAmount === customDonationAmount2 ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
            fontSize: { xs: '14px', md: '16px' },
            fontWeight: 600,
            '&:hover': {
              backgroundColor: selectedAmount === customDonationAmount2 ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.15)',
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          ${customDonationAmount2}
        </Button>
        
        <Button
          variant={selectedAmount === customDonationAmount3 ? "contained" : "outlined"}
          onClick={() => handlePresetAmountClick(customDonationAmount3)}
          sx={{
            minWidth: { xs: '45px', md: '60px' },
            height: { xs: '36px', md: '40px' },
            borderRadius: '20px',
            borderColor: uiBorderColor,
            color: selectedAmount === customDonationAmount3 ? 'white' : textColor,
            backgroundColor: selectedAmount === customDonationAmount3 ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
            fontSize: { xs: '14px', md: '16px' },
            fontWeight: 600,
            '&:hover': {
              backgroundColor: selectedAmount === customDonationAmount3 ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.15)',
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          ${customDonationAmount3}
        </Button>
        
        {/* Custom Amount Input */}
        <TextField
          type="number"
          value={customAmount}
          onChange={handleCustomAmountChange}
          placeholder="$100"
          sx={{
            width: { xs: '60px', md: '100px' },
            '& .MuiOutlinedInput-root': {
              height: { xs: '36px', md: '40px' },
              
              backgroundColor: selectedAmount === null && customAmount ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
              color: selectedAmount === null && customAmount ? 'white' : textColor,
              borderRadius: '20px',
              fontSize: { xs: '14px', md: '16px' },
              fontWeight: 600,
              '&:hover': {
                backgroundColor: selectedAmount === null && customAmount ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.15)',
              },
              '&.Mui-focused': {
                backgroundColor: selectedAmount === null && customAmount ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.15)',
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
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
            '& input[type=number]::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& input[type=number]::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'center'
            },
          }}
        />
      </Box>
      
      {/* Name/Handle Input with Social Dropdown */}
      <Box sx={{ position: 'relative', mb: 3, }} data-dropdown-container>
        <TextField
          fullWidth
          ref={inputRef}
          value={userHandle}
          onChange={handleUserHandleChange}
          placeholder="Name or @yoursocial"
          InputProps={{
            startAdornment: selectedSocial ? (
              <InputAdornment position="start">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  px: 1,
                  py: 0.5,
                  mr: 1,
                  border: '1px solid rgba(255, 255, 255, 0.6)'
                }}>
                  {selectedSocial.icon}
                </Box>
              </InputAdornment>
            ) : undefined,
          }}
          sx={{
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
        
        {/* Social Media Dropdown - Fixed with proper anchor */}
        {showSocialDropdown && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 1,
              zIndex: 1300,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)', // More opaque for visibility
              border: `2px solid ${theme.palette.primary.main}`, // Prominent border
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.4)',
              minWidth: '200px',
              width: 'fit-content',
            }}
          >
            <List sx={{ p: 0 }}>
              {socialOptions.map((social, index) => (
                <ListItem
                  key={index}
                  component="div"
                  onClick={() => handleSocialSelect(social)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    {social.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={social.name}
                    secondary={social.handle}
                    primaryTypographyProps={{
                      color: 'rgba(0, 0, 0, 0.87)',
                      fontWeight: 500,
                      fontSize: '14px'
                    }}
                    secondaryTypographyProps={{
                      color: 'rgba(0, 0, 0, 0.6)',
                      fontSize: '12px'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
      
      {/* Message Input */}
      <TextField
        fullWidth
        multiline
        rows={3}
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        placeholder="Spread some good vibes! (optional)"
        sx={{
          mb: 3,
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
      
      {/* Powered by Pepay - Now Clickable */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mb: 2,
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
          🎉 Donation of ${donationComplete.amount_usd} completed! Thank you {donationComplete.donor_name}!
        </Alert>
      )}
      
      {/* Support Button */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSupport}
        disabled={currentAmount <= 0 || donationLoading}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
          py: 1.5,
          borderRadius: '25px',
          fontSize: '16px',
          textTransform: 'none',
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
          },
          '&:disabled': {
            bgcolor: 'rgba(0, 0, 0, 0.1)',
            color: subtleTextColor,
          }
        }}
      >
        {donationLoading ? 'Processing...' : `Support $${currentAmount > 0 ? currentAmount : '0'}`}
      </Button>
      
      {donationError && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {donationError.message}
        </Typography>
      )}
    </Box>
  );
}