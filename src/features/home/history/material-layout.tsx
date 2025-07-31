// src/features/home/material-layout.tsx
import React from 'react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

// MUI Components
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
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
import SvgIcon from '@mui/material/SvgIcon';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import AppsRoundedIcon from '@mui/icons-material/AppsRounded'
import CodeRoundedIcon from '@mui/icons-material/CodeRounded'
// import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded'
// import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded'
// import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
// import TwitterIcon from '@mui/icons-material/Twitter'
// import GitHubIcon from '@mui/icons-material/GitHub'
// import TelegramIcon from '@mui/icons-material/Telegram'
import OpacityIcon from '@mui/icons-material/Opacity'
import LocalPizzaIcon from '@mui/icons-material/LocalPizza'

// Material 3 Theme Provider
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'

// Import the glassmorphic theme
import { glassmorphicTheme } from './glassmorphic-theme';

interface MaterialLayoutProps {
  children: React.ReactNode
}

// Custom faucet icon
function FaucetIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M20,20V4c0-1.1-0.9-2-2-2H6C4.9,2,4,2.9,4,4v16H20z M8,5h8v3H8V5z M14,17h-4v-6h4V17z" />
    </SvgIcon>
  );
}

// Navigation items for the left sidebar (matching Material Design website)
const navigationItems = [
  { title: "Home", path: "/", icon: <HomeRoundedIcon /> },
  { title: "Get started", path: "/sign-in", icon: <AppsRoundedIcon /> },
  // { title: "Develop", path: "https://docs.pepay.io", icon: <CodeRoundedIcon />, external: true },
  // { title: "Faucet", path: "/faucet", icon: <OpacityIcon /> },
  { title: "Community", path: "https://peperuney.pizza", icon: <LocalPizzaIcon /> },
];

// Drawer width for desktop
const DRAWER_WIDTH = 90;

export default function MaterialLayout({ children }: MaterialLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useTheme();

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <ThemeProvider theme={glassmorphicTheme}>
      <Box 
        sx={{ 
          display: 'flex', 
          minHeight: '100vh', 
          bgcolor: 'background.default',
          backgroundImage: 'url("/images/background/image.png")',
  
     
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(1px)',
            zIndex: 0,
          }
        }}
      >
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
              // Apply the same glassmorphic styling as ProfileNavbar
              background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '4px 0 16px rgba(31, 38, 135, 0.1)',
              overflowY: 'visible',
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
            {/* Logo at the top - Keep original sizing */}
            <Box sx={{ 
              width: 51, 
              height: 51, 
              borderRadius: '12px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3,
              p: 0,
              overflow: 'hidden'
            }}>
              <img 
                src="/images/gmas-app-square.png" 
                alt="Grab Me A Slice Logo" 
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
                    component={item.external ? 'a' : Link}
                    to={!item.external ? item.path : undefined}
                    href={item.external ? item.path : undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'center',
                      flexDirection: 'column',
                      px: 2.5,
                      borderRadius: 2, // Rounded square highlight
                      color: 'rgba(255, 255, 255, 0.9)', // White text
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        borderRadius: 2, // Ensure rounded square on hover
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.9)', // White icons
                        mb: 0.5,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title} 
                      primaryTypographyProps={{
                        variant: 'body2',
                        align: 'center',
                        sx: { 
                          fontWeight: 500,
                          color: 'rgba(255, 255, 255, 0.9)', // White text
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Mobile Top AppBar */}
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            display: { xs: 'block', md: 'none' },
            // Apply the same glassmorphic styling as desktop sidebar
            background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 16px rgba(31, 38, 135, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)', // White text to match sidebar
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: 'rgba(255, 255, 255, 0.9)', // White icon
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }
              }}
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
                  src="/images/gmas-app-square.png" 
                  alt="Grab Me A Slice Icon" 
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
                  height: 40, // Adjust height as needed
                  display: { xs: 'block', md: 'none' }
                }}
              >
                <img 
                  src="/images/gmas-written.png" 
                  alt="Grab Me a Slice"
                  className='h-12  object-contain'
                  style={{ 
                    height: '100%',
                    width: 'auto',
                    objectFit: 'contain',
                    marginTop: '2px'                
                  }} 
                />
              </Box>
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
                  src="/images/gmas-app-square.png" 
                  alt="Pepay Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </Box>
              <Box 
                sx={{ 
                  height: 40, // Adjust height as needed
                  display: { xs: 'block', md: 'none' }
                }}
              >
                <img 
                  src="/images/gmas-written.png" 
                  alt="Grab Me a Slice"
                  className='h-12  object-contain'
                  style={{ 
                    height: '100%',
                    width: 'auto',
                    objectFit: 'contain',
                    marginTop: '2px'                
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
                  component={item.external ? 'a' : Link}
                  to={!item.external ? item.path : undefined}
                  href={item.external ? item.path : undefined}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={toggleMobileDrawer}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      fontFamily: '"Google Sans Text", sans-serif',
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
            bgcolor: 'transparent',
            zIndex: 1,
            position: 'relative',
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
    </ThemeProvider>
  );
}