import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Typography, 
  Divider, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from '@tanstack/react-router';
import { userAuth } from '@/lib/userAuth';
import { useToast } from '@/hooks/use-toast';

// Function to get a consistent avatar based on wallet address
const getWalletAvatar = (walletAddress: string): string => {
  const profileImages = [
    '/images/profiles/1.jpg', '/images/profiles/2.jpg', '/images/profiles/3.jpg',
    '/images/profiles/4.png', '/images/profiles/5.png', '/images/profiles/6.png',
    '/images/profiles/7.png', '/images/profiles/8.png', '/images/profiles/9.png',
    '/images/profiles/10.png', '/images/profiles/11.jpg', '/images/profiles/12.png',
    '/images/profiles/13.jpg', '/images/profiles/14.png', '/images/profiles/15.png',
    '/images/profiles/16.png', '/images/profiles/17.jpeg', '/images/profiles/18.png',
    '/images/profiles/19.png', '/images/profiles/20.png', '/images/profiles/21.jpeg',
    '/images/profiles/22.png', '/images/profiles/23.png', '/images/profiles/24.jpg',
    '/images/profiles/25.jpg', '/images/profiles/26.jpeg', '/images/profiles/27.png',
    '/images/profiles/28.jpg', '/images/profiles/29.jpg', '/images/profiles/30.png',
    '/images/profiles/31.png', '/images/profiles/32.png'
  ];

  // Generate consistent index based on wallet address
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    const char = walletAddress.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % profileImages.length;
  return profileImages[index];
};

// Function to truncate wallet address
const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function AuthenticationButton() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [authState, setAuthState] = useState(userAuth.getAuthState());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Update auth state when component mounts or when localStorage changes
  useEffect(() => {
    const updateAuthState = () => {
      setAuthState(userAuth.getAuthState());
    };

    updateAuthState();
    
    // Listen for storage changes (logout from other tabs)
    window.addEventListener('storage', updateAuthState);
    
    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    handleProfileMenuClose();
    
    try {
      const result = await userAuth.logoutWithAPI();
      
      if (result.success) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your wallet session.",
          variant: "default",
        });
        
        // Update local state
        setAuthState(userAuth.getAuthState());
        
        // Optional: Redirect to home or refresh page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Logout completed",
          description: result.message,
          variant: "default",
        });
        
        // Update local state even if API failed
        setAuthState(userAuth.getAuthState());
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout error",
        description: "There was an issue logging out, but your session has been cleared.",
        variant: "destructive",
      });
      
      // Update local state
      setAuthState(userAuth.getAuthState());
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLoginClick = () => {
    const currentPath = window.location.pathname + window.location.search;
    
    navigate({ 
      to: '/user-sign-in',
      search: (prev: any) => ({ 
        ...prev,
        redirect: currentPath 
      })
    });
  };

  // Styles for the authentication button
  const buttonStyles = {
    position: isMobile ? 'relative' : 'fixed' as const,
    top: isMobile ? 'auto' : '20px',
    right: isMobile ? 'auto' : '20px',
    zIndex: theme.zIndex.appBar + 1,
  };

  return (
    <>
      {authState.isAuthenticated && authState.walletAddress ? (
        // Authenticated: Show user profile button
        <>
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{
              ...buttonStyles,
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <Avatar
              src={getWalletAvatar(authState.walletAddress)}
              sx={{
                width: 32,
                height: 32,
              }}
            >
              <PersonIcon sx={{ fontSize: 18 }} />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={getWalletAvatar(authState.walletAddress)}
                  sx={{
                    width: 40,
                    height: 40,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#202124' }}>
                    Connected Wallet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5f6368', fontFamily: 'monospace' }}>
                    {truncateAddress(authState.walletAddress)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider />
            
            <MenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: '#ffebee',
                },
                py: 1.5,
              }}
            >
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              {isLoggingOut ? 'Logging out...' : 'Sign out'}
            </MenuItem>
          </Menu>
        </>
      ) : (
        // Not authenticated: Show sign in button
        <IconButton
          onClick={handleLoginClick}
          sx={{
            ...buttonStyles,
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <AccountCircleIcon sx={{ fontSize: 24, color: '#5f6368' }} />
        </IconButton>
      )}
    </>
  );
}