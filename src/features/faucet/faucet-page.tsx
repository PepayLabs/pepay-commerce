import React, { useState, useCallback, useEffect } from 'react';
import MaterialLayout from '../home/material-layout';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  TextField, 
  Button, 
  Grid,
  CircularProgress,
  Link,
  Modal,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';

// Response type for faucet API
interface FaucetResponse {
  message: string;
  transaction_hash: string;
  explorer_url: string;
}

// Network tab content components with forms
const BinanceTabContent = () => {
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<FaucetResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [captchaValue1, setCaptchaValue1] = useState(0);
  const [captchaValue2, setCaptchaValue2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = useCallback(() => {
    setCaptchaValue1(Math.floor(Math.random() * 10));
    setCaptchaValue2(Math.floor(Math.random() * 10));
    setCaptchaAnswer('');
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (parseInt(captchaAnswer) !== captchaValue1 + captchaValue2) {
      setCaptchaError(true);
      generateCaptcha(); // Generate a new captcha
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setCaptchaError(false);
    
    try {
      const response = await fetch('http://api.pepay.io/api/faucet/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: 'bsc',
          wallet_address: walletAddress,
          email: email
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request tokens');
      }
      
      const data: FaucetResponse = await response.json();
      setResponseData(data);
      setModalOpen(true);
      
      // Reset form
      setEmail('');
      setWalletAddress('');
    } catch (error) {
      console.error('Error requesting tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to request tokens');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTxHash = () => {
    if (responseData?.transaction_hash) {
      navigator.clipboard.writeText(responseData.transaction_hash);
      setCopySuccess(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseCopyAlert = () => {
    setCopySuccess(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Binance Testnet Faucet</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Request test stablecoins on the Binance Smart Chain testnet.
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Token Contract Address: 0x142dba341134411bf1d89a757ffb18648b02bc07 (
        <Link 
          href="https://support.metamask.io/manage-crypto/portfolio/how-to-import-a-token-in-metamask-portfolio/" 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ color: '#6750A4', textDecoration: 'underline' }}
        >
          add to your wallet
        </Link>)
      </Typography>
      
      {/* Caution box */}
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: '#FFF8E1', // Light yellow background
          border: '1px solid #FFECB3', // Slightly darker yellow border
          borderRadius: 2,
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Typography sx={{ color: '#FF6F00', fontWeight: 500 }}>
          Requests limited to 1 per day
        </Typography>
      </Paper>
      
      {error && (
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: '#FFEBEE', // Light red background
            border: '1px solid #FFCDD2', // Slightly darker red border
            borderRadius: 2,
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography sx={{ color: '#C62828', fontWeight: 500 }}>
            {error}
          </Typography>
        </Paper>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Wallet Address"
              fullWidth
              required
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              sx={{ mb: 3 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              p: 2,
              bgcolor: captchaError ? '#FFEBEE' : '#F5F5F5',
              borderRadius: 1,
              border: captchaError ? '1px solid #FFCDD2' : 'none'
            }}>
              <Typography sx={{ mr: 2 }}>
                {captchaValue1} + {captchaValue2} = 
              </Typography>
              <TextField
                size="small"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                error={captchaError}
                placeholder="?"
                inputProps={{ 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  style: { width: '60px' } 
                }}
              />
              <IconButton 
                size="small" 
                onClick={generateCaptcha} 
                sx={{ ml: 1 }}
                title="Generate new captcha"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
            {captchaError && (
              <Typography 
                variant="caption" 
                color="error" 
                sx={{ display: 'block', mb: 2 }}
              >
                Incorrect answer. Please try again.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              sx={{ 
                minWidth: 120,
                height: 48
              }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Request Tokens"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Success Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="transaction-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="transaction-modal-title" variant="h6" component="h2">
              Transaction Successful
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {responseData?.message}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: '#F5F5F5', 
            p: 2, 
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {responseData?.transaction_hash}
            </Typography>
            <IconButton onClick={handleCopyTxHash} size="small" sx={{ ml: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Button 
            variant="outlined" 
            fullWidth
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(responseData?.explorer_url, '_blank')}
          >
            View on Explorer
          </Button>
        </Box>
      </Modal>

      {/* Copy Success Alert */}
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={3000} 
        onClose={handleCloseCopyAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyAlert} severity="success" sx={{ width: '100%' }}>
          Transaction hash copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

const BaseTabContent = () => {
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseData, setResponseData] = useState<FaucetResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [captchaValue1, setCaptchaValue1] = useState(0);
  const [captchaValue2, setCaptchaValue2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const generateCaptcha = useCallback(() => {
    setCaptchaValue1(Math.floor(Math.random() * 10));
    setCaptchaValue2(Math.floor(Math.random() * 10));
    setCaptchaAnswer('');
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (parseInt(captchaAnswer) !== captchaValue1 + captchaValue2) {
      setCaptchaError(true);
      generateCaptcha(); // Generate a new captcha
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setCaptchaError(false);
    
    try {
      const response = await fetch('http://api.pepay.io/api/faucet/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network: 'base',
          wallet_address: walletAddress,
          email: email
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request tokens');
      }
      
      const data: FaucetResponse = await response.json();
      setResponseData(data);
      setModalOpen(true);
      
      // Reset form
      setEmail('');
      setWalletAddress('');
    } catch (error) {
      console.error('Error requesting tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to request tokens');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTxHash = () => {
    if (responseData?.transaction_hash) {
      navigator.clipboard.writeText(responseData.transaction_hash);
      setCopySuccess(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCloseCopyAlert = () => {
    setCopySuccess(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Base Testnet Faucet</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Request test stablecoins on the Base testnet for testing payments.
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Token Contract Address: 0xac90bf4484551D0A8De4d4C32cbc29841b4d13DC (
        <Link 
          href="https://support.metamask.io/manage-crypto/portfolio/how-to-import-a-token-in-metamask-portfolio/" 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ color: '#6750A4', textDecoration: 'underline' }}
        >
          add to your wallet
        </Link>)
      </Typography>
      {/* Caution box */}
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: '#FFF8E1', // Light yellow background
          border: '1px solid #FFECB3', // Slightly darker yellow border
          borderRadius: 2,
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Typography sx={{ color: '#FF6F00', fontWeight: 500 }}>
          Requests limited to 1 per day
        </Typography>
      </Paper>
      
      {error && (
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: '#FFEBEE', // Light red background
            border: '1px solid #FFCDD2', // Slightly darker red border
            borderRadius: 2,
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography sx={{ color: '#C62828', fontWeight: 500 }}>
            {error}
          </Typography>
        </Paper>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Wallet Address"
              fullWidth
              required
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              sx={{ mb: 3 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              p: 2,
              bgcolor: captchaError ? '#FFEBEE' : '#F5F5F5',
              borderRadius: 1,
              border: captchaError ? '1px solid #FFCDD2' : 'none'
            }}>
              <Typography sx={{ mr: 2 }}>
                {captchaValue1} + {captchaValue2} = 
              </Typography>
              <TextField
                size="small"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                error={captchaError}
                placeholder="?"
                inputProps={{ 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  style: { width: '60px' } 
                }}
              />
              <IconButton 
                size="small" 
                onClick={generateCaptcha} 
                sx={{ ml: 1 }}
                title="Generate new captcha"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
            {captchaError && (
              <Typography 
                variant="caption" 
                color="error" 
                sx={{ display: 'block', mb: 2 }}
              >
                Incorrect answer. Please try again.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              sx={{ 
                minWidth: 120,
                height: 48
              }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Request Tokens"}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Success Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="transaction-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="transaction-modal-title" variant="h6" component="h2">
              Transaction Successful
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {responseData?.message}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: '#F5F5F5', 
            p: 2, 
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {responseData?.transaction_hash}
            </Typography>
            <IconButton onClick={handleCopyTxHash} size="small" sx={{ ml: 1 }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Button 
            variant="outlined" 
            fullWidth
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(responseData?.explorer_url, '_blank')}
          >
            View on Explorer
          </Button>
        </Box>
      </Modal>

      {/* Copy Success Alert */}
      <Snackbar 
        open={copySuccess} 
        autoHideDuration={3000} 
        onClose={handleCloseCopyAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseCopyAlert} severity="success" sx={{ width: '100%' }}>
          Transaction hash copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

const ArbitrumTabContent = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h5" sx={{ mb: 2 }}>Arbitrum Testnet Faucet</Typography>
    <Typography variant="body1">
      Coming soon! Arbitrum testnet support is under development.
    </Typography>
  </Box>
);

export default function FaucetPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Don't allow selecting the "coming soon" tab (Arbitrum)
    if (newValue !== 2) {
      setSelectedTab(newValue);
    }
  };

  return (
    <MaterialLayout>
      {/* Hero Section - Similar to home page with text and image */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        height: { md: '500px' },
        mb: 6,
        gap: { xs: 2, md: 3 },
        pl: { xs: 0, md: 0 },
        pr: { xs: 0, md: 0 },
        maxWidth: '100%',
        mx: { xs: 0, md: 0 },
      }}>
        {/* Left side - Text content */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: '#f8f1f6',
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          height: { xs: 'auto', md: '100%' }
        }}>
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '3rem', md: '5rem' },
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#202124',
              mb: 2
            }}
          >
            Pepay Stables Faucet
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.5,
              color: '#5f6368',
              mb: 4,
              maxWidth: '90%'
            }}
          >
            Test Stable Coin payments on your favorite networks
          </Typography>
        </Box>
        
        {/* Right side - Image */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          bgcolor: '#e8f0fe',
          borderRadius: 4,
          p: 0, // Removed padding
          height: { xs: '300px', md: '100%' },
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box 
            component="img"
            src="/images/faucet-photo.jpg"
            alt="Faucet illustration"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 4, // Match parent borderRadius
            }}
          />
        </Box>
      </Box>

      {/* Network Tabs Section */}
      <Box sx={{ 
        px: { xs: 4, md: '50px' },
        mb: 8
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: '#f8f1f6',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#6750A4',
              },
              '& .MuiTab-root': {
                color: '#202124', // Changed to black to match the heading
                fontFamily: '"Google Sans Text", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 600, // Increased from 500 to 600 for stronger visibility
                textTransform: 'none',
                fontSize: '1.1rem', // Slightly increased font size
                py: 2,
                '&.Mui-selected': {
                  color: '#202124', // Keep black when selected
                  bgcolor: 'rgba(103, 80, 164, 0.08)',
                  fontWeight: 700, // Even bolder when selected
                },
              }
            }}
          >
            <Tab 
              icon={
                <Box 
                  component="img" 
                  src="/images/bnb.webp" 
                  alt="Binance" 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    mr: 1, 
                    verticalAlign: 'middle' 
                  }} 
                />
              }
              iconPosition="start"
              label="Binance" 
            />
            <Tab 
              icon={
                <Box 
                  component="img" 
                  src="/images/base.png" 
                  alt="Base" 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    mr: 1, 
                    verticalAlign: 'middle' 
                  }} 
                />
              }
              iconPosition="start"
              label="Base" 
            />
            <Tab 
              label="Arbitrum (coming soon)" 
              disabled
              sx={{
                opacity: 0.6,
                fontStyle: 'italic',
                color: '#202124', // Ensure disabled tab is also black
              }}
            />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ bgcolor: 'white' }}>
            {selectedTab === 0 && <BinanceTabContent />}
            {selectedTab === 1 && <BaseTabContent />}
            {selectedTab === 2 && <ArbitrumTabContent />}
          </Box>
        </Paper>
      </Box>
    </MaterialLayout>
  );
}