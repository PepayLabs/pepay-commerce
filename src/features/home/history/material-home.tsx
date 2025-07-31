import { Link, useNavigate } from '@tanstack/react-router'
import MaterialLayout from '../material-layout'
import { Box, Typography, Button, Card, CardContent, CardMedia, IconButton } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import TwitterIcon from '@mui/icons-material/Twitter'
import GitHubIcon from '@mui/icons-material/GitHub'
import TelegramIcon from '@mui/icons-material/Telegram'

import { useTheme } from '@mui/material/styles'
import SEOMetadata from '../../../components/SEOMetadata'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import MaterialInfluencerDiscovery from '../components/material-influencer-discovery'

// Add these CSS properties at the top of your file or in a separate CSS file
const glassmorphismStyles = {
  // Button Container
  buttonWrap: {
    position: 'relative',
    zIndex: 2,
    borderRadius: '999vw',
    background: 'transparent',
  },
  
  // Button Shadow
  buttonShadow: {
    position: 'absolute',
    width: 'calc(100% + 2em)',
    height: 'calc(100% + 2em)',
    top: '-1em',
    left: '-1em',
    filter: 'blur(4px)',
    overflow: 'visible',
    pointerEvents: 'none',
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: 0,
      inset: 0,
      borderRadius: '999vw',
      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1))',
      width: 'calc(100% - 2.25em)',
      height: 'calc(100% - 2.25em)',
      top: '1.5em',
      left: '1.125em',
      padding: '0.125em',
      boxSizing: 'border-box',
      mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      maskComposite: 'exclude',
      transition: 'all 400ms cubic-bezier(0.25, 1, 0.5, 1)',
      overflow: 'visible',
      opacity: 1,
    }
  },

  // Button Base
  button: {
    position: 'relative',
    background: 'linear-gradient(-75deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
    borderRadius: '999vw',
    boxShadow: `
      inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05),
      inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5),
      0 0.25em 0.125em -0.125em rgba(0, 0, 0, 0.2),
      0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2),
      0 0 0 0 rgba(255, 255, 255, 1)
    `,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    transition: 'all 400ms cubic-bezier(0.25, 1, 0.5, 1)',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(0.975)',
      backdropFilter: 'blur(0.01em)',
      WebkitBackdropFilter: 'blur(0.01em)',
      boxShadow: `
        inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05),
        inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5),
        0 0.15em 0.05em -0.1em rgba(0, 0, 0, 0.25),
        0 0 0.05em 0.1em inset rgba(255, 255, 255, 0.5),
        0 0 0 0 rgba(255, 255, 255, 1)
      `,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: 1,
      inset: 0,
      borderRadius: '999vw',
      width: 'calc(100% + 1px)',
      height: 'calc(100% + 1px)',
      top: '-0.5px',
      left: '-0.5px',
      padding: '1px',
      boxSizing: 'border-box',
      background: `
        conic-gradient(
          from -75deg at 50% 50%,
          rgba(0, 0, 0, 0.5),
          rgba(0, 0, 0, 0) 5% 40%,
          rgba(0, 0, 0, 0.5) 50%,
          rgba(0, 0, 0, 0) 60% 95%,
          rgba(0, 0, 0, 0.5)
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5))
      `,
      mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      maskComposite: 'exclude',
      transition: 'all 400ms cubic-bezier(0.25, 1, 0.5, 1)',
      boxShadow: 'inset 0 0 0 0.5px rgba(255, 255, 255, 0.5)',
    },
    '&:hover::after': {
      background: `
        conic-gradient(
          from -125deg at 50% 50%,
          rgba(0, 0, 0, 0.5),
          rgba(0, 0, 0, 0) 5% 40%,
          rgba(0, 0, 0, 0.5) 50%,
          rgba(0, 0, 0, 0) 60% 95%,
          rgba(0, 0, 0, 0.5)
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5))
      `,
    }
  },

  // Button Text
  buttonText: {
    position: 'relative',
    display: 'block',
    userSelect: 'none',
    fontFamily: '"Inter", sans-serif',
    letterSpacing: '-0.05em',
    fontWeight: 500,
    color: 'rgba(50, 50, 50, 1)',
    textShadow: '0em 0.25em 0.05em rgba(0, 0, 0, 0.1)',
    transition: 'all 400ms cubic-bezier(0.25, 1, 0.5, 1)',
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      zIndex: 1,
      width: 'calc(100% - 1px)',
      height: 'calc(100% - 1px)',
      top: '0.5px',
      left: '0.5px',
      borderRadius: '999vw',
      overflow: 'clip',
      background: 'linear-gradient(-45deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 40% 50%, rgba(255, 255, 255, 0) 55%)',
      mixBlendMode: 'screen',
      pointerEvents: 'none',
      backgroundSize: '200% 200%',
      backgroundPosition: '0% 50%',
      backgroundRepeat: 'no-repeat',
      transition: 'background-position 500ms cubic-bezier(0.25, 1, 0.5, 1)',
    },
    '&:hover::after': {
      backgroundPosition: '25% 50%',
    }
  }
};

// Function to get a consistent fallback avatar based on display name (same as ProfileHeader)
const getFallbackAvatar = (displayName: string): string => {
  const profileImages = [
    '/images/profiles/1.jpg',
    '/images/profiles/2.jpg', 
    '/images/profiles/3.jpg',
    '/images/profiles/4.png',
    '/images/profiles/5.png',
    '/images/profiles/6.png',
    '/images/profiles/7.png',
    '/images/profiles/8.png',
    '/images/profiles/9.png',
    '/images/profiles/10.png',
    '/images/profiles/11.jpg',
    '/images/profiles/12.png',
    '/images/profiles/13.jpg',
    '/images/profiles/14.png',
    '/images/profiles/15.png',
    '/images/profiles/16.png',
    '/images/profiles/17.jpeg',
    '/images/profiles/18.png',
    '/images/profiles/19.png',
    '/images/profiles/20.png',
    '/images/profiles/21.jpeg',
    '/images/profiles/22.png',
    '/images/profiles/23.png',
    '/images/profiles/24.jpg',
    '/images/profiles/25.jpg',
    '/images/profiles/26.jpeg',
    '/images/profiles/27.jpg',
    '/images/profiles/28.png',
    '/images/profiles/29.png',
    '/images/profiles/30.png',
    '/images/profiles/31.png',
    '/images/profiles/32.png'
  ];

  // Generate consistent index based on display name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    const char = displayName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % profileImages.length;
  return profileImages[index];
};



export default function MaterialHome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  
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
        if (videoRef.current.readyState >= 3) {
          videoRef.current.play().catch(err => console.error("Video play error:", err));
          setIsPlaying(true);
        }
      }
    }
  };

  const toggleMute = () => {
    setMuted((prev) => {
      if (videoRef.current) {
        videoRef.current.muted = !prev;
      }
      return !prev;
    });
  };

  // Listen for video events to keep state in sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Auto-play after video loads with 2-second delay
    const handleCanPlay = () => {
      if (!hasAutoPlayed) {
        setTimeout(() => {
          if (video && !hasAutoPlayed && video.readyState >= 3) {
            video.play().catch(err => console.error("Auto-play error:", err));
            setHasAutoPlayed(true);
          }
        }, 2000); // 2-second delay
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
  }, [hasAutoPlayed, muted]);

  // Enhanced SEO data
  const breadcrumbs = [
    { name: 'Home', url: 'https://grabmeaslice.com' }
  ];

  const faqData = [
    {
      question: "What is Grab Me A Slice?",
      answer: "Grab Me A Slice is the world's first creator and non-profit oriented platform for raising support and donations in pure cryptocurrency. We enable creators, influencers, and non-profits to receive support through Bitcoin, Ethereum, and other cryptocurrencies."
    },
    {
      question: "How does crypto donation work?",
      answer: "Users can support their favorite creators and non-profits by sending cryptocurrency directly to their wallet addresses. Our platform facilitates secure, transparent, and instant crypto transactions worldwide."
    },
    {
      question: "What cryptocurrencies are supported?",
      answer: "We support major cryptocurrencies including Bitcoin (WBTC), BNB (BNB), Solana (SOL), Ethereum (ETH), USD Coin (USDC), Tether (USDT), and tokens on multiple blockchain networks including Polygon and Binance Smart Chain."
    },
    {
      question: "Is it safe to donate crypto through your platform?",
      answer: "Yes, our platform uses industry-standard security practices. All transactions are secured by blockchain technology, and we never hold your funds - donations go directly to the recipient's wallet."
    }
  ];

  // Enhanced structured data
  const enhancedStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Grab Me A Slice",
      "url": "https://grabmeaslice.com",
      "description": "The first creator and non-profit oriented platform for cryptocurrency donations",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "Grab Me A Slice"
      },
      "featureList": [
        "Cryptocurrency Donations",
        "Multi-chain Support", 
        "Creator Profiles",
        "Non-profit Support",
        "Secure Transactions",
        "Global Accessibility"
      ]
    }
  ];

  return (
    <>
      <SEOMetadata
        title="Grab Me A Slice - The First Creator & Non-Profit Crypto Support Platform"
        description="The world's first creator and non-profit oriented platform for raising support and donations in pure cryptocurrency. Support creators with Bitcoin, Ethereum & more. Secure, instant, global."
        keywords={[
          'first crypto donation platform',
          'creator crypto support',
          'non-profit cryptocurrency', 
          'blockchain philanthropy',
          'bitcoin donations',
          'ethereum tipping',
          'web3 creator economy',
          'crypto influencer support',
          'decentralized giving',
          'multi-chain donations'
        ]}
        url="https://grabmeaslice.com"
        type="website"
        structuredData={enhancedStructuredData}
        breadcrumbs={breadcrumbs}
        faqData={faqData}
        videoUrl={isPlaying ? "/images/hero-video.mp4" : undefined}
        section="Homepage"
        tags={['crypto', 'donations', 'creators', 'non-profit', 'web3', 'blockchain']}
        priceRange="$0-∞"
        availability="InStock"
        publishDate="2024-01-01T00:00:00Z"
        modifiedDate={new Date().toISOString()}
      />

      <MaterialLayout>
        {/* Hero Section with mobile-first responsive design */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', md: 'row' }, // Stack on mobile with video on top
            width: '100%',
            height: { xs: 'auto', md: '500px' }, // Auto height on mobile
            mb: 6,
            gap: { xs: 2, md: 3 },
            pl: { xs: 0, md: 0 },
            pr: { xs: 0, md: 0 },
            maxWidth: '100%',
            mx: { xs: 0, md: 0 },
            minHeight: { xs: 'auto', md: 500 }, // Auto min-height on mobile
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: '37.6667%' }, // Full width on mobile
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
              backdropFilter: 'blur(50px)',
              WebkitBackdropFilter: 'blur(50px)',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
              p: { xs: 3, md: 6 }, // Reduced padding on mobile
              height: { xs: 'auto', md: '100%' }
            }}
          >
            <Box
              component="img"
              src="/images/gmas-written-filled.png"
              alt="Grab Me A Slice Logo"
              sx={{
                width: { xs: '80%', md: '600px' }, // Smaller on mobile
                maxWidth: '100%',
                height: 'auto',
                mb: 3,
                display: 'block',
                mx: 'auto',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))'
              }}
            />
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.9rem', md: '1.25rem' }, // Smaller text on mobile
                lineHeight: 1.5,
                color: '#ffffff',
                mb: 4,
                maxWidth: '90%',
                textAlign: 'center',
                textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
              }}
            >
              The Influencer & Non-Profit Web3 support platform
            </Typography>
            <Box sx={{ ...glassmorphismStyles.buttonWrap, alignSelf: 'center' }}>
              <Box sx={glassmorphismStyles.buttonShadow} />
              <Button
                variant="contained"
                component={Link}
                to="/sign-in"
                size="large"
                sx={{
                  ...glassmorphismStyles.button,
                  py: { xs: 2, md: 2.5 }, // Smaller padding on mobile
                  px: { xs: 6, md: 8 }, // Smaller padding on mobile
                  fontSize: { xs: '1rem', md: '1.25rem' }, // Smaller font on mobile
                  fontWeight: theme.typography.button.fontWeight,
                  borderRadius: 100,
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  }
                }}
              >
                <Box component="span" sx={{
                  ...glassmorphismStyles.buttonText,
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                  Get started
                </Box>
              </Button>
            </Box>
          </Box>
          
          <Box
            sx={{
              width: { xs: '100%', md: '58.3333%' }, // Full width on mobile
              minWidth: 0,
              height: { xs: '250px', md: '100%' }, // Fixed height on mobile
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            <Box
              component="video"
              ref={videoRef}
              src="/images/hero-video.mp4"
              poster="/images/video-thumbnail.png"
              muted={muted}
              loop
              playsInline
              preload="auto"
              onClick={toggleVideo}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Audio Mute/Unmute button in bottom left corner */}
            <IconButton
              onClick={toggleMute}
              sx={{
                position: 'absolute',
                bottom: { xs: 16, md: 24 }, // Smaller spacing on mobile
                left: { xs: 16, md: 24 }, // Smaller spacing on mobile
                width: { xs: 40, md: 48 }, // Smaller button on mobile
                height: { xs: 40, md: 48 }, // Smaller button on mobile
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {muted ? (
                <VolumeOffIcon fontSize="medium" />
              ) : (
                <VolumeUpIcon fontSize="medium" />
              )}
            </IconButton>

            {/* Play/Pause button in bottom right corner */}
            <IconButton
              onClick={toggleVideo}
              sx={{
                position: 'absolute',
                bottom: { xs: 16, md: 24 }, // Smaller spacing on mobile
                right: { xs: 16, md: 24 }, // Smaller spacing on mobile
                width: { xs: 40, md: 48 }, // Smaller button on mobile
                height: { xs: 40, md: 48 }, // Smaller button on mobile
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {isPlaying ? (
                <PauseIcon fontSize="medium" />
              ) : (
                <PlayArrowIcon fontSize="medium" />
              )}
            </IconButton>
          </Box>
        </Box>

        {/* Features Section with glassmorphic cards */}
        <Box sx={{
          mt: 12,
          mb: 8,
          px: {
            xs: 2,
            sm: '32px',
            md: '64px',
            lg: '80px',
            xl: '8%'
          },
          maxWidth: '1600px',
          mx: 'auto'
        }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#ffffff',
              mb: 5,
              textAlign: 'left',
              fontFamily: '"Google Sans Display", "Roboto", sans-serif',
              textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
            }}
          >
            Get Started in 3 Steps
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
            {[
              {
                title: "Sign Up in Seconds",
                description: "Create your  account and join hundreds of supported creators & non-profits",
                image: "/images/card-prod-4.PNG",
                bgcolor: "#8BC34A"
              },
              {
                title: "Setup Your Wallets",
                description: "Connect multiple crypto wallets to receive payments across all chains",
                image: "/images/card-prod-3.PNG",
                bgcolor: "#4CAF50"
              },
              {
                title: "Go Live Today",
                description: "Complete your profile, share your link, create exclusive content for supporters and start earning from day one",
                image: "/images/card-prod-5.PNG",
                bgcolor: "#673AB7"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                sx={{ 
                  width: 'calc(33.333% - 16px)',
                  height: 360,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
                  backdropFilter: 'blur(50px)',
                  WebkitBackdropFilter: 'blur(50px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                  transition: 'all 0.3s ease-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(31, 38, 135, 0.25)',
                  },
                  '@media (max-width: 900px)': {
                    width: 'calc(50% - 8px)',
                  },
                  '@media (max-width: 600px)': {
                    width: '100%'
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
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </Box>
                <CardContent 
                  className="content-container"
                  sx={{ 
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
                      color: '#ffffff',
                      fontFamily: '"Google Sans", "Roboto", sans-serif',
                      textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      color: '#ffffff',
                      fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                      textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* TECH Section */}
{/*        
        <Box sx={{
          mt: 12,
          mb: 8,
          px: {
            xs: 2,
            sm: '32px',
            md: '64px',
            lg: '80px',
            xl: '8%'
          },
          maxWidth: '1600px',
          mx: 'auto'
        }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#ffffff',
              mb: 5,
              textAlign: 'left',
              fontFamily: '"Google Sans Display", "Roboto", sans-serif',
              textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
            }}
          >
           Earn Runey, Build Value
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
            {[
            {
              title: "Earn by Giving & Receiving",
              description: "Get Runey rewards for every donation you make or receive - supporting others pays you too",
              image: "/images/card-prod-2.png",
              bgcolor: "#FF9800"
            },
            {
              title: "Top Creator Bonuses",
              description: "Highest earning creators unlock premium Runey multipliers and exclusive airdrop access",
              image: "/images/card-prod-6.PNG",
              bgcolor: "#2196F3"
            },
            {
              title: "Developer Ecosystem",
              description: "Build on PePay infrastructure and shape the future of decentralized payments",
              image: "/images/card-prod-1.PNG",
              bgcolor: "#9C27B0"
            }
            ].map((tech, index) => (
              <Card 
                key={index}
                sx={{ 
                  width: 'calc(33.333% - 16px)',
                  height: 360,
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
                  backdropFilter: 'blur(50px)',
                  WebkitBackdropFilter: 'blur(50px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                  transition: 'all 0.3s ease-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(31, 38, 135, 0.25)',
                  },
                  '@media (max-width: 900px)': {
                    width: 'calc(50% - 8px)',
                  },
                  '@media (max-width: 600px)': {
                    width: '100%'
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
                      color: '#ffffff',
                      fontFamily: '"Google Sans", "Roboto", sans-serif',
                      textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
                    }}
                  >
                    {tech.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      color: '#ffffff',
                      fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                      textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
                    }}
                  >
                    {tech.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Resources Section */}
        {/* <Box sx={{
          mt: 12,
          mb: 8,
          px: {
            xs: 2,
            sm: '32px',
            md: '64px',
            lg: '80px',
            xl: '8%'
          },
          maxWidth: '1600px',
          mx: 'auto'
        }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#ffffff',
              mb: 5,
              textAlign: 'left',
              fontFamily: '"Google Sans Display", "Roboto", sans-serif',
              textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
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
                path: "mailto:contact@peperuney.pizza"
              },
              {
                title: "Community",
                description: "Join our crypto loving community grab a slice of pizza. We have some of the best content and pizza",
                path: "https://peperuney.pizza"
              },
              {
                title: "Binance Contract Address",
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
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: 4,
                  background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
                  backdropFilter: 'blur(50px)',
                  WebkitBackdropFilter: 'blur(50px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(31, 38, 135, 0.25)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .resource-arrow': {
                      transform: 'translateX(4px)',
                      opacity: 1,
                    }
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
                    color: '#ffffff',
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {resource.title}
                  <Box 
                    className="resource-arrow"
                    sx={{
                      opacity: 0.7,
                      transform: 'translateX(0)',
                      transition: 'all 0.3s ease',
                      ml: 2,
                      '&::after': {
                        content: '"→"',
                        fontSize: '1.5rem',
                        lineHeight: 1,
                      }
                    }}
                  />
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    color: '#ffffff',
                    fontFamily: '"Google Sans Text", "Roboto", sans-serif',
                    textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000',
                    opacity: 0.9
                  }}
                >
                  {resource.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>
 */}

        {/* Discover Creators Section - Now using separate component */}
        <Box sx={{
          mt: 12,
          mb: 8,
          px: {
            xs: 2,
            sm: '32px',
            md: '64px',
            lg: '80px',
            xl: '8%'
          },
          maxWidth: '1600px',
          mx: 'auto'
        }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#ffffff',
              mb: 5,
              textAlign: 'left',
              fontFamily: '"Google Sans Display", "Roboto", sans-serif',
              textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
            }}
          >
            Discover Creators
          </Typography>
          
          <MaterialInfluencerDiscovery />
        </Box>

        {/* Footer Section */}
        <Box sx={{ 
          mt: 12,
          mb: 4,
          px: { 
            xs: 2,      // Small mobile screens
            sm: '32px',  // Larger mobile/small tablets
            md: '100px', // Medium screens (tablets/small desktops)
            lg: '175px', // Large screens
            xl: '15%'    // Extra large screens - percentage-based for flexibility
          }
        }}>
          {/* Main footer section */}
          <Box sx={{ 
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            p: { xs: 2.5, md: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2, md: 3 },
          }}>
            
            {/* Built by section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1.5
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: '14px',
                  background: 'linear-gradient(45deg, #22c55e, #ef4444, #ffd700, #22c55e)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 2s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                  }
                }}
              >
                Built by the team at
              </Typography>
              <Box sx={{ 
                height: 36,
                display: 'flex',
                alignItems: 'center'
              }}>
                <a 
                  href="https://pepay.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img 
                    src="/images/PEPAY-logo-written-prod.png"
                    alt="Pepay"
                    style={{ 
                      height: '100%',
                      width: 'auto',
                      objectFit: 'contain'
                    }} 
                  />
                </a>
              </Box>
            </Box>

            {/* Social Links */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
            }}>
              <IconButton 
                aria-label="Twitter"
                component="a"
                href="https://twitter.com/peperuneypizza"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { 
                    color: '#1DA1F2',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TwitterIcon />
              </IconButton>
              
              <IconButton 
                aria-label="GitHub"
                component="a"
                href="https://github.com/pepay"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { 
                    color: '#ffffff',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
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
                  color: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { 
                    color: '#0088cc',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <TelegramIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Terms strip */}
          <Box sx={{ 
            mt: 1,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            py: 1.5,
            px: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              fontWeight: 500,
              '&:hover': {
                color: '#ffffff'
              }
            }}>
              <Link 
                to="/terms" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                Terms of Service
              </Link>
            </Box>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>•</Typography>
            <Box sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              fontWeight: 500,
              '&:hover': {
                color: '#ffffff'
              }
            }}>
              <Link 
                to="/privacy" 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                Privacy Policy
              </Link>
            </Box>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>•</Typography>
            <a 
              href="mailto:Contact@peperuney.pizza" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s ease-in-out'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              Contact
            </a>
          </Box>
        </Box>
      </MaterialLayout>
    </>
  )
}
