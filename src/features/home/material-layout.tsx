// src/features/home/material-layout.tsx
import React from 'react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

// MUI Components
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
// import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
// import Container from '@mui/material/Container'
import Badge from '@mui/material/Badge';

// Custom Components
import AuthenticationButton from './components/AuthenticationButton';
import CartButton from './components/CartButton';
import { CartModal } from '@/features/cart/components/CartModal';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import LocalPizzaIcon from '@mui/icons-material/LocalPizza'

// Material 3 Theme Provider
import { ThemeProvider, createTheme } from '@mui/material/styles'

interface MaterialLayoutProps {
  children: React.ReactNode
}

// Create a Material 3 theme
const materialTheme = createTheme({
  palette: {
    primary: {
      main: '#6750A4', // Material 3 primary color
    },
    secondary: {
      main: '#625B71', // Material 3 secondary color
    },
    background: {
      default: '#FFFBFE', // Material 3 background color
      paper: '#FFFFFF',
    }
  },
  shape: {
    borderRadius: 16, // Material 3 uses more rounded corners
  },
  typography: {
    fontFamily: '"Google Sans Text", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontSize: '4rem',
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.5,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Material 3 buttons are pill-shaped
          textTransform: 'none', // Material 3 doesn't use uppercase text
          fontFamily: '"Google Sans Text", "Roboto", sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: '"Google Sans Text", "Roboto", sans-serif',
        },
      },
    },
  },
});


// Import additional components
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import Tooltip from '@mui/material/Tooltip';
import { userAuth } from '@/lib/userAuth';
import { useEffect } from 'react';
import { useCartItemCount } from '@/features/cart/store/cartStore';

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

// Drawer width for desktop
const DRAWER_WIDTH = 90;

export default function MaterialLayout({ children }: MaterialLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [authState, setAuthState] = useState(userAuth.getAuthState());
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const cartItemCount = useCartItemCount();

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

  // Navigation items for the left sidebar - now dynamic based on auth state
  const navigationItems = [
    { title: "Home", path: "/", icon: <HomeRoundedIcon /> },
    { 
      title: authState.isAuthenticated ? "Account" : "Account", 
      path: authState.isAuthenticated ? "/account" : "/sign-in", 
      icon: authState.isAuthenticated && authState.walletAddress ? (
        <Avatar 
          src={getWalletAvatar(authState.walletAddress)}
          sx={{ width: 24, height: 24 }}
        >
          <PersonIcon sx={{ fontSize: 16 }} />
        </Avatar>
      ) : (
        <AccountCircleRoundedIcon />
      )
    },
    { 
      title: "Cart", 
      path: "/cart", 
      icon: <ShoppingCartRoundedIcon />, 
      badge: cartItemCount,
      onClick: () => setCartModalOpen(true) // Open cart modal instead of navigating
    },
    { title: "History", path: "/history", icon: <HistoryRoundedIcon /> },
    { title: "Community", path: "https://community.pepay.io", icon: <LocalPizzaIcon />, external: true },
  ];

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <ThemeProvider theme={materialTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Desktop buttons - Cart and Authentication in fixed corner */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <CartButton onClick={() => setCartModalOpen(true)} />
          <AuthenticationButton />
        </Box>
        
        {/* Desktop Left Sidebar - Permanent on desktop */}
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'rgb(242, 236, 238)', // Exact color from Material Design website
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              overflowY: 'visible', // Prevent scrolling
            },
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            height: '100%', 
            py: 2,
            px: 1
          }}>
            {/* Logo at the top - Changed to rounded square */}
            <Box sx={{ 
              width: 51, 
              height: 51, 
              borderRadius: '12px', // Changed from 50% to 12px for rounded square
              // bgcolor: '#E8DEF8', // Light purple background for logo
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3,
              p: 0, // Remove padding to allow logo to fill shape
              overflow: 'hidden' // Ensure logo stays within shape
            }}>
              <img 
                src="/images/pepay-labs-logo.png" 
                alt="Pepay Labs Logo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </Box>
            
            {/* Navigation items */}
            <List sx={{ width: '100%', p: 0 }}>
              {navigationItems.map((item) => (
                <ListItem key={item.title} disablePadding sx={{ display: 'block', mb: 1 }}>
                  <ListItemButton
                    component={item.external ? 'a' : item.onClick ? 'button' : Link}
                    to={!item.external && !item.onClick ? item.path : undefined}
                    href={item.external ? item.path : undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={item.onClick}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'center',
                      flexDirection: 'column',
                      px: 2.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'rgba(103, 80, 164, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        color: 'inherit',
                        mb: 0.5,
                      }}
                    >
                      {item.badge !== undefined ? (
                        <Badge 
                          badgeContent={item.badge} 
                          showZero={false}
                          sx={{
                            '& .MuiBadge-badge': {
                              background: 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              minWidth: '18px',
                              height: '18px',
                              padding: '0 4px',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              boxShadow: '0 2px 8px rgba(0,140,255,0.25)',
                            }
                          }}
                        >
                          {item.icon}
                        </Badge>
                      ) : item.title === "Account" && authState.isAuthenticated && authState.walletAddress ? (
                        <Tooltip title={`Wallet: ${authState.walletAddress.slice(0, 6)}...${authState.walletAddress.slice(-4)}`} placement="right">
                          <span>{item.icon}</span>
                        </Tooltip>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '.95rem',
                          textAlign: 'center',
                          fontWeight: 400
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <AppBar 
          position="fixed" 
          color="default"
          sx={{ 
            display: { xs: 'block', md: 'none' },
            bgcolor: 'background.paper',
            color: 'text.primary'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Logo container for mobile - now with both logos side by side */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1
              }}
            >
              {/* Original icon logo */}
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1 // Small margin to separate the logos
              }}>
                <img 
                  src="/images/pepay-labs-logo.png" 
                  alt="Pepay Icon" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    padding: '2px'
                  }} 
                />
              </Box>
              
              {/* Text logo - for mobile only */}
              <Box 
                sx={{ 
                  height: 28, // Adjust height as needed
                  display: { xs: 'block', md: 'none' }
                }}
              >
                <img 
                  src="/images/pepay_written_logo.png" 
                  alt="PEPAY" 
                  style={{ 
                    height: '115%',
                    width: 'auto',
                    objectFit: 'contain'
                  }} 
                />
              </Box>
            </Box>
            
            {/* Cart and Authentication buttons for mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
              <CartButton onClick={() => setCartModalOpen(true)} />
              <AuthenticationButton />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer - Temporary, shows on menu click */}
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
              bgcolor: 'background.default',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '10px', // Changed from 50% to 10px for rounded square
                overflow: 'hidden',
                mr: 1.5
              }}>
                <img 
                  src="/images/pepay-labs-logo.png" 
                  alt="Pepay Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </Box>
              
              {/* Replace Typography with image */}
              <Box 
                sx={{ 
                  height: 24, // Adjust height as needed
                }}
              >
                <img 
                  src="/images/pepay_written_logo.png" 
                  alt="PEPAY" 
                  style={{ 
                    height: '130%',
                    width: 'auto',
                    objectFit: 'contain'
                  }} 
                />
              </Box>
            </Box>
            <IconButton onClick={toggleMobileDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {navigationItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  component={item.external ? 'a' : item.onClick ? 'button' : Link}
                  to={!item.external && !item.onClick ? item.path : undefined}
                  href={item.external ? item.path : undefined}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    }
                    toggleMobileDrawer();
                  }}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.badge !== undefined ? (
                      <Badge 
                        badgeContent={item.badge} 
                        showZero={false}
                        sx={{
                          '& .MuiBadge-badge': {
                            background: 'radial-gradient(circle at 30% 30%, rgba(0,140,255,0.95) 0%, rgba(0,75,170,0.95) 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: '18px',
                            height: '18px',
                            padding: '0 4px',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 2px 8px rgba(0,140,255,0.25)',
                          }
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: '"Google Sans Text", sans-serif',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: { xs: '64px', md: 0 },
            overflow: 'auto',
            bgcolor: '#F8F9FA',
          }}
        >
          <Box 
            sx={{ 
              py: { xs: 2, md: 4 },
              px: { xs: 2, md: 4 }
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
      
      {/* Cart Modal */}
      <CartModal 
        open={cartModalOpen} 
        onClose={() => setCartModalOpen(false)} 
      />
    </ThemeProvider>
  );
}