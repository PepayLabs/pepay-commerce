import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box,  IconButton, Avatar, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from '@tanstack/react-router';
import ShareIcon from '@mui/icons-material/Share';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useContrastColors } from '../hooks/useContrastColors';
import ShareModal from './ShareModal';
import { userAuth } from '@/lib/userAuth';
import { useToast } from '@/hooks/use-toast';

interface ProfileNavbarProps {
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
  displayLink: string;
  displayName: string;
  bio: string;
  profileImageSignedUrl?: string;
  accountType: string;
}

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

export default function ProfileNavbar({ 
  backgroundColor = null, 
  backgroundImageUrl = null,
  textColor = null,
  displayLink,
  displayName,
  bio,
  profileImageSignedUrl,
  accountType
}: ProfileNavbarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [authState, setAuthState] = useState(userAuth.getAuthState());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Get colors based on the background
  const { 
    uiBorderColor,
    uiBackgroundColor 
  } = useContrastColors(backgroundColor, backgroundImageUrl);

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

  const handleLogoClick = () => {
    navigate({ to: '/home' });
  };

  const handleShareClick = () => {
    setShareModalOpen(true);
  };

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

  const renderUserProfile = () => {
    if (!authState.isAuthenticated || !authState.walletAddress) {
      return null;
    }

    const avatarSrc = getWalletAvatar(authState.walletAddress);
    const truncatedAddress = truncateAddress(authState.walletAddress);

    return (
      <>
        <IconButton
          onClick={handleProfileMenuOpen}
          sx={{
            p: 0.5,
            ml: 1,
            border: `2px solid ${textColor || theme.palette.primary.main}20`,
            backgroundColor: `${textColor || theme.palette.primary.main}10`,
            '&:hover': {
              backgroundColor: `${textColor || theme.palette.primary.main}20`,
              border: `2px solid ${textColor || theme.palette.primary.main}40`,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Avatar
            src={avatarSrc}
            sx={{
              width: 32,
              height: 32,
              border: `1px solid ${textColor || theme.palette.primary.main}30`,
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
              minWidth: 220,
              borderRadius: 2,
              background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.95) 2.12%, rgba(255, 255, 255, 0.8) 39%, rgba(255, 255, 255, 0.8) 54.33%, rgba(255, 255, 255, 0.9) 93.02%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${uiBorderColor}`,
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 40,
                  height: 40,
                  border: `2px solid ${theme.palette.primary.main}30`,
                }}
              >
                <PersonIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  Connected Wallet
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontFamily: 'monospace' }}>
                  {truncatedAddress}
                </Typography>
              </Box>
            </Box>
            
            {authState.permissions && (
              <Box sx={{ mt: 1, p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  Access to {Object.keys(authState.permissions.accounts || {}).length} creator{Object.keys(authState.permissions.accounts || {}).length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
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
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${uiBorderColor}`,
          boxShadow: '0 4px 16px rgba(31, 38, 135, 0.1)',
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: 64, md: 72 }
        }}>
          
          {/* Logo Section */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={handleLogoClick}
          >
            {/* App Logo */}
            <Box sx={{ 
              width: { xs: 36, md: 40 }, 
              height: { xs: 36, md: 40 }, 
              borderRadius: '10px',
              overflow: 'hidden',
              mr: { xs: 1, md: 1.5 }
            }}>
              <img 
                src="/images/gmas-app-square.png" 
                alt="Grab Me a Slice Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </Box>

            {/* Text Logo - Show on mobile and desktop */}
            <Box 
              sx={{ 
                height: { xs: 32, md: 36 },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img 
                src="/images/gmas-written.png" 
                alt="Grab Me a Slice"
                style={{ 
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain'              
                }} 
              />
            </Box>
          </Box>

          {/* Right Section - Share Button and Login/User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Share Button - Always circular for consistency */}
            <IconButton
              onClick={handleShareClick}
              sx={{
                color: textColor || theme.palette.primary.main,
                backgroundColor: textColor ? `${textColor}10` : `${theme.palette.primary.main}10`,
                border: `1px solid ${textColor || theme.palette.primary.main}20`,
                '&:hover': {
                  backgroundColor: textColor ? `${textColor}20` : `${theme.palette.primary.main}20`,
                  border: `1px solid ${textColor || theme.palette.primary.main}40`,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ShareIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Login/Profile Section */}
            {authState.isAuthenticated ? (
              // Authenticated: Show user profile (existing code)
              renderUserProfile()
            ) : (
              // Not authenticated: Show circular login button
              <IconButton
                onClick={handleLoginClick}
                sx={{
                  color: textColor || theme.palette.primary.main,
                  backgroundColor: textColor ? `${textColor}10` : `${theme.palette.primary.main}10`,
                  border: `2px solid ${textColor || theme.palette.primary.main}20`,
                  '&:hover': {
                    backgroundColor: textColor ? `${textColor}20` : `${theme.palette.primary.main}20`,
                    border: `2px solid ${textColor || theme.palette.primary.main}40`,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <AccountCircleIcon sx={{ fontSize: 24 }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        displayLink={displayLink}
        displayName={displayName}
        bio={bio}
        profileImageSignedUrl={profileImageSignedUrl}
        accountType={accountType}
      />
    </>
  );
}