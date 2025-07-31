import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { userAuth } from '@/lib/userAuth';

interface ContentPurchaseSuccessProps {
  content: {
    content_id: string;
    title: string;
    content_type: string;
    price: number;
    cover_image_url?: string;
  };
  creator: {
    display_name: string;
    display_link: string;
    profile_image_url?: string;
  };
  onViewContent: () => void;
  onBackToProfile: () => void;
  onSignIn: () => void;
}

export default function ContentPurchaseSuccess({
  content,
  creator,
  onViewContent,
  onBackToProfile,
  onSignIn
}: ContentPurchaseSuccessProps) {
  const theme = useTheme();
  const authState = userAuth.getAuthState();

  return (
    <Box sx={{ 
      textAlign: 'center',
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      maxHeight: '100%',
      overflow: 'auto',
    }}>
      {/* Success Icon */}
      <Box>
        <CheckCircleIcon 
          sx={{ 
            fontSize: 50,
            color: theme.palette.success.main,
            filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.3))'
          }} 
        />
      </Box>

      {/* Success Message */}
      <Box>
        <Typography 
          variant="h6"
          fontWeight={600} 
          color="white" 
          mb={0.5}
          sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          🎉 Purchase Complete!
        </Typography>

        <Typography 
          variant="body2" 
          color="rgba(255, 255, 255, 0.8)"
          sx={{ lineHeight: 1.3, fontSize: '0.875rem' }}
        >
          You now have permanent access to{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'white' }}>
            {content.title}
          </Box>
        </Typography>
      </Box>

      {/* Content Preview - More Compact */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          p: 1.5,
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {content.cover_image_url && (
          <Box sx={{ mb: 1 }}>
            <img
              src={content.cover_image_url}
              alt={content.title}
              style={{
                width: '100%',
                height: 60,
                objectFit: 'cover',
                borderRadius: 6,
              }}
            />
          </Box>
        )}
        
        <Typography variant="caption" color="white" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
          ${content.price} • {content.content_type}
        </Typography>
      </Box>

      {/* Creator Info - More Compact */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          p: 1.5,
        }}
      >
        <Avatar
          src={creator.profile_image_url}
          sx={{ width: 24, height: 24 }}
        >
          {creator.display_name?.charAt(0)}
        </Avatar>
        <Typography variant="caption" color="white" sx={{ fontSize: '0.8rem' }}>
          by {creator.display_name}
        </Typography>
      </Box>

      {/* Action Buttons - More Compact */}
      {authState.isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
            onClick={onViewContent}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              py: 1,
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '0.875rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            View Content Now
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={onBackToProfile}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              py: 0.5,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Back to {creator.display_name}'s Profile
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="caption" color="white" mb={0.5} sx={{ fontSize: '0.8rem' }}>
            Sign in to access your purchased content
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonIcon sx={{ fontSize: 16 }} />}
            onClick={onSignIn}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              fontWeight: 600,
              py: 1,
              borderRadius: '16px',
              textTransform: 'none',
              fontSize: '0.875rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Sign In to View Content
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={onBackToProfile}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.75rem',
              py: 0.5,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Continue Browsing
          </Button>
        </Box>
      )}

      {!authState.isAuthenticated && (
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(67, 160, 71, 0.1) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #4caf50, #43a047)',
              opacity: 0.8,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AccountBalanceWalletIcon sx={{ color: '#4caf50', fontSize: 24 }} />
            <Typography
              variant="h6"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              Important: Access Your Content
            </Typography>
          </Box>
          
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            To view your purchased content, sign in with the <strong>same wallet</strong> you used for payment.
          </Typography>
          
          <Button
            variant="outlined"
            onClick={onSignIn}
            sx={{
              color: '#4caf50',
              borderColor: '#4caf50',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderColor: '#4caf50',
              },
            }}
          >
            Sign In Now
          </Button>
        </Box>
      )}
    </Box>
  );
}