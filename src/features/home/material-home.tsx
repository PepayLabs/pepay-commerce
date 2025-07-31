import { Link } from '@tanstack/react-router'
import MaterialLayout from './material-layout'
import TypewriterText from './material-typewriter'
import { Box, Typography, Button, Card, CardContent, CardMedia, IconButton, Paper, InputBase, Chip, CircularProgress, Fade, Grow, keyframes } from '@mui/material'
import { useState, useRef, useEffect, useCallback } from 'react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import TwitterIcon from '@mui/icons-material/Twitter'
import GitHubIcon from '@mui/icons-material/GitHub'
import TelegramIcon from '@mui/icons-material/Telegram'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import axios from 'axios'
import { useSearch } from './hooks/useSearch'
import { SearchBar } from './components/SearchBar'
import { SearchResults } from './components/SearchResults'
import { Product } from './types/search.types'

export default function MaterialHome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [showResults, setShowResults] = useState(false);
  
  // Use the search hook
  const {
    isLoading,
    isLoadingMore,
    error,
    products,
    hasMore,
    currentPage,
    totalPages,
    totalResults,
    search,
    loadMore,
    clearResults,
    retry,
  } = useSearch({
    enableCache: true,
    debounceMs: 0, // No debounce - instant search on submit
    onSuccess: () => {
      setShowResults(true);
    },
  });
  
  // Handle search - memoized to prevent re-renders
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      clearResults();
      setShowResults(false);
      return;
    }
    
    search({
      q: query,
      page: 1,
      retailer: 'amazon',
      // Add country when backend supports it
      // country: selectedCountry,
    });
  }, [search, clearResults]);
  
  // Enhanced clear function that also hides results
  const handleClearResults = useCallback(() => {
    clearResults();
    setShowResults(false);
  }, [clearResults]);
  
  // Handle product click - memoized
  const handleProductClick = useCallback((product: Product) => {
    // Open product in new tab
    window.open(product.url, '_blank', 'noopener,noreferrer');
  }, []);
  
  // Preload the video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(err => console.error("Video play error:", err));
        setIsPlaying(true);
      }
    }
  };

  // Listen for video events to keep state in sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    // Auto-play after video loads with 3-second delay
    const handleCanPlay = () => {
      if (!hasAutoPlayed) {
        setTimeout(() => {
          if (video && !hasAutoPlayed) {
            video.play().catch(err => console.error("Auto-play error:", err));
            setHasAutoPlayed(true);
          }
        }, 2000); // 3-second delay
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [hasAutoPlayed]);

  return (
    <MaterialLayout>
      {/* Premium Search Section */}
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: '60vh', sm: '65vh', md: '75vh' },
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 },
        maxWidth: '100%',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }
      }}>
        {/* Pepay Commerce Logo */}
        <Fade in={true} timeout={800}>
          <Box sx={{ 
            mb: { xs: 4, md: 6 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: { xs: '280px', sm: '380px', md: '480px' },
            position: 'relative',
            zIndex: 1,
            animation: 'subtle-float 6s ease-in-out infinite',
            '@keyframes subtle-float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            }
          }}>
            <img 
              src="/images/pepay_commerce_banner.png" 
              alt="Pepay Commerce" 
              style={{ 
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 20px rgba(37, 99, 235, 0.1))'
              }} 
            />
          </Box>
        </Fade>

        {/* Enhanced Search Bar with Google-style Effects */}
        <Fade in={true} timeout={1000}>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              showCountrySelector={true}
              clearResults={handleClearResults}
            />
          </Box>
        </Fade>


      </Box>

      {/* Search Results Section */}
      {showResults && (
        <SearchResults
          products={products}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          error={error}
          hasMore={hasMore}
          totalResults={totalResults}
          currentPage={currentPage}
          searchQuery={searchQuery}
          onLoadMore={loadMore}
          onRetry={retry}
          onProductClick={handleProductClick}
        />
      )}

      {/* Commented out existing hero section */}
      {/* <Box sx={{ 
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
        ... existing hero section code ...
      </Box> */}

      {/* Features Section */}
      {/* <Box sx={{ 
        mt: 12, 
        mb: 8,
        px: { 
          xs: 2,      // Small mobile screens
          sm: '32px',  // Larger mobile/small tablets
          md: '50px', // Medium screens (tablets/small desktops)
          lg: '80px', // Large screens
          xl: '15%'    // Extra large screens - percentage-based for flexibility
        }
      }}>
        <Typography 
          variant="h2" 
          component="h2" 
          sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 500,
            lineHeight: 1.2,
            color: '#202124',
            mb: 5,
            textAlign: 'left',
            fontFamily: '"Google Sans Text", "Roboto", sans-serif'
          }}
        >
          Features
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
          {[
            {
              title: "MCP for Crypto Payments",
              description: "Crypto payments that connect directly to claude, LLMs, and agent frameworks",
              image: "/images/card-prod-4.PNG",
              bgcolor: "#8BC34A"
            },
            {
              title: "Inventory Management",
              description: "Manage payment information across all your AI agents",
              image: "/images/card-prod-3.PNG",
              bgcolor: "#4CAF50"
            },
            {
              title: "Multi-Chain and Non-Custodial",
              description: "We operate on EVM and SVM and support transfer to stables seamlessly",
              image: "/images/card-prod-5.PNG",
              bgcolor: "#673AB7"
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                width: 'calc(33.333% - 16px)',
                height: 360,
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'none',
                bgcolor: '#f8f1f6', 

                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#cbbeff',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  '& .content-container': {
                    bgcolor: '#cbbeff',
                  }
                },
                '@media (max-width: 900px)': {
                  width: 'calc(50% - 8px)',
                },
                '@media (max-width: 600px)': {
                  width: '100%',
                }
              }}
            >
              <Box 
                className="thumb-container"
                sx={{
                  height: 200,
                  backgroundColor: feature.bgcolor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  p: 0

                }}
              >
                <CardMedia
                  component="img"
                  image={feature.image}
                  alt={feature.title}
                  sx={{
                    width: '120%',
                    height: '120%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    bgcolor: '#f8f1f6', 

                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </Box>
              <CardContent 
                className="content-container"
                sx={{ 
                  bgcolor: '#f8f1f6', 
                  p: 3,
                  height: 170,
                  transition: 'background-color 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'left',
                  alignItems: 'left'
                }}
              >
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.25rem',
                    mb: 1,
                    color: '#202124',
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    color: '#202124',
                    
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box> */}

      {/* TECH Section */}
      {/* <Box sx={{ 
        mt: 12, 
        mb: 8,
        px: { 
          xs: 2,     // Small mobile screens
          sm: '32px',  // Larger mobile/small tablets
          md: '50px', // Medium screens (tablets/small desktops)
          lg: '80px', // Large screens
          xl: '15%'    // Extra large screens - percentage-based for flexibility
        }
      }}>
        <Typography 
          variant="h2" 
          component="h2" 
          sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 500,
            lineHeight: 1.2,
            color: '#202124',
            mb: 5,
            textAlign: 'left',
            fontFamily: '"Google Sans Text", "Roboto", sans-serif'
          }}
        >
          Tech
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
          {[
            {
              title: "SDK & MCP READY",
              description: "Seamless integrate the protocol with agents, games, and wordpress",
              image: "/images/card-prod-2.png",
              bgcolor: "#FF9800"
            },
            {
              title: "TEE SECURED",
              description: "Advanced security protocols ensure your data is secure",
              image: "/images/card-prod-6.PNG",
              bgcolor: "#2196F3"
            },
            {
              title: "Chain Abstraction",
              description: "Built to support multiple chains and settlement paths while maintaining a single payment interface",
              image: "/images/card-prod-1.PNG",
              bgcolor: "#9C27B0"
            }
          ].map((tech, index) => (
            <Card 
              key={index}
              sx={{ 
                width: 'calc(33.333% - 16px)',
                height: 360,
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                bgcolor: '#f8f1f6', 

                '&:hover': {
                  bgcolor: '#cbbeff',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  '& .content-container': {
                    bgcolor: '#cbbeff',
                  }
                },
                '@media (max-width: 900px)': {
                  width: 'calc(50% - 8px)',
                },
                '@media (max-width: 600px)': {
                  width: '100%',
                }
              }}
            >
              <Box 
                className="thumb-container"
                sx={{
                  height: 200,
                  backgroundColor: tech.bgcolor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  p: 0
                }}
              >
                <CardMedia
                  component="img"
                  image={tech.image}
                  alt={tech.title}
                  sx={{
                    width: '120%',
                    height: '120%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </Box>
              <CardContent 
                className="content-container"
                sx={{ 
                  bgcolor: '#f8f1f6', 
                  p: 3,
                  height: 160,
                  transition: 'background-color 0.3s ease'
                }}
              >
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '1.35rem',
                    mb: 1,
                    color: '#202124',
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {tech.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    color: '#202124',
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {tech.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box> */}

      {/* Resources Section */}
      {/* <Box sx={{ 
        mt: 12, 
        mb: 8,
        px: { 
          xs: 2,      // Small mobile screens
          sm: '20px',  // Larger mobile/small tablets
          md: '100px', // Medium screens (tablets/small desktops)
          lg: '175px', // Large screens
          xl: '15%'    // Extra large screens - percentage-based for flexibility
        }
      }}>
        <Typography 
          variant="h2" 
          component="h2" 
          sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 400,
            lineHeight: 1.2,
            color: '#202124',
            mb: 5,
            textAlign: 'left',
            fontFamily: '"Google Sans Text", "Roboto", sans-serif'
          }}
        >
          Resources
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[
            {
              title: "Read the docs",
              description: "Get the latest in docs, tutorials, and more to get started with Pepay",
              path: "https://docs.pepay.io"
            },
            {
              title: "Partner with us",
              description: "We are always looking for new partners to build with us",
              path: "mailto:contact@pepay.io"
            },
            {
              title: "Community",
              description: "Join our crypto loving community grab a slice of pizza. We have some of the best reels and vibes!",
              path: "https://community.pepay.io"
            },
            {
              title: "BNB Contract Address",
              description: "CA",
              path: "https://bscscan.com/"
            }
          ].map((resource, index) => (
            <Card 
              key={index}
              component={Link}
              to={resource.path}
              sx={{ 
                width: 'calc(50% - 12px)',
                height: 160,
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 4,
                bgcolor: '#f8f1f6',
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                '&:hover': {
                  bgcolor: '#cbbeff',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                },
                '@media (max-width: 600px)': {
                  width: '100%',
                }
              }}
            >
              <Typography 
                variant="h6" 
                component="div"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.35rem',
                  mb: 1,
                  color: '#202124',
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif'
                }}
              >
                {resource.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  color: '#5f6368',
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif'
                }}
              >
                {resource.description}
              </Typography>
            </Card>
          ))}
        </Box>
      </Box> */}

      {/* Footer Section */}
      <Box sx={{ 
        mt: 12,
        pt: 4,
        borderTop: '1px solid #e0e0e0',
        px: { 
          xs: 4,      // Small mobile screens
          sm: '32px',  // Larger mobile/small tablets
          md: '100px', // Medium screens (tablets/small desktops)
          lg: '175px', // Large screens
          xl: '15%'    // Extra large screens - percentage-based for flexibility
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          pb: 4
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: '#E8DEF8',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5,
                overflow: 'hidden'
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
              <Typography 
                variant="h6" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#202124',
                  fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                }}
              >
                Pepay
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              mt: 1.5,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Link 
                to="/terms" 
                style={{ textDecoration: 'none' }}
              >
                <Typography 
                  variant="body2" 
                  sx={{
                    fontSize: '0.875rem',
                    color: '#5f6368',
                    '&:hover': { color: '#202124' },
                    transition: 'color 0.2s'
                  }}
                >
                  Terms of Service
                </Typography>
              </Link>
              
              <Link 
                to="/privacy" 
                style={{ textDecoration: 'none' }}
              >
                <Typography 
                  variant="body2" 
                  sx={{
                    fontSize: '0.875rem',
                    color: '#5f6368',
                    '&:hover': { color: '#202124' },
                    transition: 'color 0.2s'
                  }}
                >
                  Privacy Policy
                </Typography>
              </Link>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            mt: { xs: 3, sm: 0 }
          }}>
            <IconButton 
              aria-label="Twitter"
              component="a"
              href="https://twitter.com/pepaylabs"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: '#5f6368',
                '&:hover': { color: '#1DA1F2' }
              }}
            >
              <TwitterIcon />
            </IconButton>
            
            <IconButton 
              aria-label="GitHub"
              component="a"
              href="https://github.com/pepaylabs"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: '#5f6368',
                '&:hover': { color: '#333' }
              }}
            >
              <GitHubIcon />
            </IconButton>
            
            <IconButton 
              aria-label="Telegram"
              component="a"
              href="https://t.me/pepay"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: '#5f6368',
                '&:hover': { color: '#0088cc' }
              }}
            >
              <TelegramIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </MaterialLayout>
  )
}
