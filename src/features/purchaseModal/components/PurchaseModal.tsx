import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent,
  Box, 
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop,
  Typography,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useContrastColors } from '@/features/profiles/hooks/useContrastColors';
import { userAuth } from '@/lib/userAuth';
import { useNavigate } from '@tanstack/react-router';
import { PurchaseModalProps } from '../types/purchase.types';
import { useContentPurchase } from '../hooks/useContentPurchase';
import { useContentPurchaseWebSocket } from '../hooks/useContentPurchaseWebSocket';
import PlatformBranding from '@/features/purchaseModal/components/PlatformBranding';
import ContentPreview from '@/features/purchaseModal/components/ContentPreview';
import ContentPreviewDesktop from '@/features/purchaseModal/components/ContentPreviewDesktop';
import CreatorInfo from '@/features/purchaseModal/components/CreatorInfo';
import PurchaseActions from '@/features/purchaseModal/components/PurchaseActions';
import ContentPreviewExpanded from '@/features/purchaseModal/components/ContentPreviewExpanded';
import ContentPaymentIframe from '@/features/purchaseModal/components/ContentPaymentIframe';
import ContentPurchaseSuccess from '@/features/purchaseModal/components/ContentPurchaseSuccess';
import PaymentHeader from '@/features/purchaseModal/components/payments/PaymentHeader';
import PaymentLayout from '@/features/purchaseModal/components/payments/PaymentLayout';


export default function PurchaseModal({
  content,
  account,
  open,
  onClose,
  onPurchase,
  onSignIn
}: PurchaseModalProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [authState, setAuthState] = useState(userAuth.getAuthState());
  const [expandedPreview, setExpandedPreview] = useState(false);
  
  // Purchase flow states
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [purchaseResponse, setPurchaseResponse] = useState<any>(null);
  
  // Hooks
  const { submitPurchase, purchaseLoading, purchaseError } = useContentPurchase();
  const { 
    isConnected, 
    contentPurchased, 
    connectionAttempts, 
    connectToPayment,
    disconnect,
    resetContentPurchased 
  } = useContentPurchaseWebSocket();

  // Get colors based on the background
  const { 
    textColor,
    subtleTextColor,
    uiBorderColor,
    uiBackgroundColor 
  } = useContrastColors(
    account.background_text_color,
    account.background_image_url
  );

  // Update auth state when modal opens
  useEffect(() => {
    if (open) {
      const updateAuthState = () => {
        setAuthState(userAuth.getAuthState());
      };
      
      updateAuthState();
      window.addEventListener('storage', updateAuthState);
      
      return () => {
        window.removeEventListener('storage', updateAuthState);
      };
    }
  }, [open]);

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setPaymentUrl(null);
      setPurchaseResponse(null);
      resetContentPurchased();
      disconnect();
    }
  }, [open, resetContentPurchased, disconnect]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('💼 Modal State Update:', {
      paymentUrl: !!paymentUrl,
      purchaseResponse: !!purchaseResponse,
      contentPurchased: !!contentPurchased,
      isPaymentState: !!(paymentUrl && !contentPurchased),
      isSuccessState: !!contentPurchased
    });
  }, [paymentUrl, purchaseResponse, contentPurchased]);

  // Handle WebSocket connection after payment URL is set and iframe is rendered
  useEffect(() => {
    if (paymentUrl && purchaseResponse && !contentPurchased) {
      console.log('🔌 Delaying WebSocket connection to allow iframe rendering...');
      
      // Delay WebSocket connection to ensure iframe renders first
      const timer = setTimeout(() => {
        console.log('🔌 Now establishing Content Purchase WebSocket connection...');
        connectToPayment(purchaseResponse.invoice_id, purchaseResponse.ws_signature);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    }
  }, [paymentUrl, purchaseResponse, contentPurchased, connectToPayment]);

  const handlePurchase = async () => {
    console.log('🛒 Starting content purchase for:', content.content_id);
    
    const response = await submitPurchase(account.display_link, content.content_id);
    
    if (response) {
      console.log('🎉 Content Purchase Response:', response);
      console.log('🔄 Setting purchase response and payment URL...');
      
      // Set states separately to ensure proper updates
      setPurchaseResponse(response);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setPaymentUrl(response.payment_url);
        console.log('✅ Payment URL set, should trigger iframe render');
      }, 100);
    }
    
    // Call parent onPurchase if provided
    if (onPurchase) {
      onPurchase(content);
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      navigate({ to: '/user-sign-in' });
    }
    onClose();
  };

  const handleCreatorClick = () => {
    navigate({ to: `/p/${account.display_link}` });
    onClose();
  };

  const handlePreviewClick = () => {
    setExpandedPreview(true);
  };

  const handleExpandedPreviewClose = () => {
    setExpandedPreview(false);
  };

  const handleBackFromPayment = () => {
    setPaymentUrl(null);
    setPurchaseResponse(null);
    disconnect();
  };

  const handleViewContent = () => {
    // Navigate to content viewing page
    navigate({ to: `/p/${account.display_link}` }); // Will need content-specific route
    onClose();
  };

  const handleBackToProfile = () => {
    navigate({ to: `/p/${account.display_link}` });
    onClose();
  };

  // Determine current state
  const isPaymentState = paymentUrl && !contentPurchased;
  const isSuccessState = contentPurchased;

  // Add more detailed debug logging
  console.log('🎭 Render State:', {
    paymentUrl,
    contentPurchased: !!contentPurchased,
    isPaymentState,
    isSuccessState,
    purchaseLoading
  });

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        <Dialog
          open={open}
          onClose={onClose}
          fullScreen={true}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
          BackdropComponent={Backdrop}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }
          }}
          PaperProps={{
            sx: {
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
              background: account.background_image_url
                ? `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0.3) 100%), url(${account.background_image_url})`
                : account.background_text_color || '#000000',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              margin: 0,
              maxHeight: '100vh',
              height: '100vh',
            }
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              position: 'relative',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.25)'}`,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <PlatformBranding textColor={textColor} />
              
              <IconButton
                onClick={onClose}
                sx={{
                  color: textColor || 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: `1px solid rgba(255, 255, 255, 0.25)`,
                  borderRadius: '12px',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                overflow: 'auto',
              }}
            >
              {isSuccessState ? (
                // Success State
                <ContentPurchaseSuccess
                  content={purchaseResponse.content}
                  creator={purchaseResponse.creator}
                  onViewContent={handleViewContent}
                  onBackToProfile={handleBackToProfile}
                  onSignIn={handleSignIn}
                />
              ) : isPaymentState ? (
                // Payment State - Mobile
                <>
                  {/* Mobile Payment Header */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    p: 3,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                  }}>
                    <IconButton
                      onClick={handleBackFromPayment}
                      sx={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: '12px',
                        width: 40,
                        height: 40,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="white">
                        Complete Payment
                      </Typography>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                        {content.title} • ${content.price}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Mobile Payment Iframe */}
                  <Box sx={{ flex: 1 }}>
                    <ContentPaymentIframe paymentUrl={paymentUrl} />
                  </Box>
                </>
              ) : (
                // Default Purchase State
                <>
                  <ContentPreview
                    content={content}
                    onPreviewClick={handlePreviewClick}
                    textColor={textColor}
                    uiBackgroundColor={uiBackgroundColor}
                    uiBorderColor={uiBorderColor}
                  />

                  <CreatorInfo
                    account={account}
                    onCreatorClick={handleCreatorClick}
                    textColor={textColor}
                    uiBackgroundColor={uiBackgroundColor}
                  />

                  <PurchaseActions
                    content={content}
                    isAuthenticated={authState.isAuthenticated}
                    onPurchase={handlePurchase}
                    onSignIn={handleSignIn}
                    textColor={textColor}
                    loading={purchaseLoading}
                  />

                  {/* WebSocket Connection Status */}
                  {isConnected && (
                    <Alert 
                      severity="info" 
                      sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}
                    >
                      🔌 Tracking payment status... (Connected)
                    </Alert>
                  )}

                  {connectionAttempts > 0 && !isConnected && (
                    <Alert 
                      severity="warning" 
                      sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)' }}
                    >
                      🔄 Reconnecting... (Attempt {connectionAttempts}/5)
                    </Alert>
                  )}

                  {purchaseError && (
                    <Alert severity="error">
                      {purchaseError.message}
                    </Alert>
                  )}
                </>
              )}
            </Box>

            {/* Powered by Pepay Footer - Only show in default state */}
            {!isPaymentState && !isSuccessState && (
              <Box
                sx={{
                  p: 2,
                  borderTop: `1px solid rgba(255, 255, 255, 0.25)`,
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
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
                      color: '#ffffff',
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
                        color: '#ffffff',
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
              </Box>
            )}
          </DialogContent>
        </Dialog>

        <ContentPreviewExpanded
          content={content}
          open={expandedPreview}
          onClose={handleExpandedPreviewClose}
          textColor={textColor}
          uiBackgroundColor={uiBackgroundColor}
          uiBorderColor={uiBorderColor}
        />
      </>
    );
  }

  // Desktop Layout - Only change during payment state
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={isPaymentState ? "lg" : "md"} // Only change size during payment
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }
        }}
        PaperProps={{
          sx: {
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
            background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
            borderRadius: '36px',
            border: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            overflow: 'hidden',
            minHeight: isPaymentState ? 700 : 600, // Only change height during payment
            maxWidth: isPaymentState ? 1200 : 900, // Only change width during payment
          }
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Header - Use PaymentHeader during payment, regular header otherwise */}
          {isPaymentState ? (
            <>
             
              <PaymentHeader
                contentTitle={content.title}
                contentPrice={content.price}
                onBack={handleBackFromPayment}
                onClose={onClose}
              />
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 4,
                borderBottom: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.25)'}`,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <PlatformBranding textColor={textColor} />
              
              <IconButton
                onClick={onClose}
                sx={{
                  color: textColor || 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: `1px solid rgba(255, 255, 255, 0.25)`,
                  borderRadius: '12px',
                  width: 48,
                  height: 48,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CloseIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
          )}

          {/* Content Layout - Use PaymentLayout during payment */}
          {isPaymentState ? (
            <PaymentLayout
              content={content}
              account={account}
              paymentUrl={paymentUrl}
              onPreviewClick={handlePreviewClick}
              textColor={textColor}
              uiBackgroundColor={uiBackgroundColor}
              uiBorderColor={uiBorderColor}
            />
          ) : (
            // Default horizontal layout (unchanged)
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                minHeight: 0,
              }}
            >
              {/* Left Side - Content Preview */}
              <Box
                sx={{
                  flex: 1,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRight: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.25)'}`,
                }}
              >
                <ContentPreviewDesktop
                  content={content}
                  onPreviewClick={handlePreviewClick}
                  textColor={textColor}
                  uiBackgroundColor={uiBackgroundColor}
                  uiBorderColor={uiBorderColor}
                />
              </Box>

              {/* Right Side - Actions */}
              <Box
                sx={{
                  width: 400,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                {isSuccessState ? (
                  <ContentPurchaseSuccess
                    content={purchaseResponse.content}
                    creator={purchaseResponse.creator}
                    onViewContent={handleViewContent}
                    onBackToProfile={handleBackToProfile}
                    onSignIn={handleSignIn}
                  />
                ) : (
                  <>
                    <CreatorInfo
                      account={account}
                      onCreatorClick={handleCreatorClick}
                      textColor={textColor}
                      uiBackgroundColor={uiBackgroundColor}
                    />

                    <PurchaseActions
                      content={content}
                      isAuthenticated={authState.isAuthenticated}
                      onPurchase={handlePurchase}
                      onSignIn={handleSignIn}
                      textColor={textColor}
                      loading={purchaseLoading}
                    />

                    {/* WebSocket Connection Status */}
                    {isConnected && (
                      <Alert 
                        severity="info" 
                        sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}
                      >
                        🔌 Tracking payment status... (Connected)
                      </Alert>
                    )}

                    {connectionAttempts > 0 && !isConnected && (
                      <Alert 
                        severity="warning" 
                        sx={{ backgroundColor: 'rgba(255, 152, 0, 0.1)' }}
                      >
                        🔄 Reconnecting... (Attempt {connectionAttempts}/5)
                      </Alert>
                    )}

                    {purchaseError && (
                      <Alert severity="error">
                        {purchaseError.message}
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Powered by Pepay Footer - Only show in default state */}
          {!isPaymentState && !isSuccessState && (
            <Box
              sx={{
                p: 3,
                borderTop: `1px solid rgba(255, 255, 255, 0.25)`,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
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
                    color: '#ffffff',
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
                      color: '#ffffff',
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
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <ContentPreviewExpanded
        content={content}
        open={expandedPreview}
        onClose={handleExpandedPreviewClose}
        textColor={textColor}
        uiBackgroundColor={uiBackgroundColor}
        uiBorderColor={uiBorderColor}
      />
    </>
  );
}