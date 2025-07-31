import { Box, IconButton, Tooltip, SvgIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRef, useEffect, useState } from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageIcon from '@mui/icons-material/Language';
import BookIcon from '@mui/icons-material/Book';
import { useContrastColors } from '../hooks/useContrastColors';

interface ProfileSocialProps {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  farcaster?: string;
  website?: string;
  blog?: string;
  stream?: string;
  telegram?: string;
  discord?: string;
  isVerified?: boolean;
}

// Brand colors for each platform
const BRAND_COLORS = {
  instagram: '#E1306C', // Instagram pink/red
  twitter: '#1DA1F2',   // Twitter blue
  tiktok: '#000000',    // TikTok black
  youtube: '#FF0000',   // YouTube red
  farcaster: '#9E58FF', // Farcaster purple
  website: '#4285F4',   // Generic web blue (Google blue)
  blog: '#ff8c00',      // Orange for blog
  stream: '#6441a5',    // Twitch purple for streaming
  telegram: '#0088cc',  // Telegram blue
  discord: '#5865F2'    // Discord blurple
};

export default function ProfileSocial({
  instagram,
  twitter,
  tiktok,
  youtube,
  farcaster,
  website,
  blog,
  stream,
  telegram,
  discord,
  isVerified = false
}: ProfileSocialProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [backgroundDetails, setBackgroundDetails] = useState({
    color: null,
    hasImage: false
  });
  
  // Get document background
  useEffect(() => {
    // Function to analyze what's behind our component
    const detectBackground = () => {
      if (!containerRef.current || typeof window === 'undefined') return;
      
      // Get the parent with the background image/color
      let parent = containerRef.current.parentElement;
      let bgColor = null;
      let hasImage = false;
      
      // Search up the DOM tree for a parent with a background
      while (parent) {
        const style = window.getComputedStyle(parent);
        
        // Check for background image
        if (style.backgroundImage && style.backgroundImage !== 'none') {
          hasImage = true;
          break;
        }
        
        // Check for background color
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          bgColor = style.backgroundColor;
          break;
        }
        
        parent = parent.parentElement;
      }
      
      setBackgroundDetails({ 
        color: bgColor, 
        hasImage: hasImage 
      });
    };
    
    // Run on mount and window resize
    detectBackground();
    window.addEventListener('resize', detectBackground);
    
    return () => {
      window.removeEventListener('resize', detectBackground);
    };
  }, []);
  
  // Get appropriate contrast colors based on detected background
  const { textColor } = useContrastColors(
    backgroundDetails.color, 
    backgroundDetails.hasImage ? 'has-image' : null
  );
  
  const isLightBg = textColor.includes('0, 0, 0'); // If text is dark, background is light
  
  // Create inline SVG icons for platforms without Material UI icons
  const TikTokIcon = () => (
    <SvgIcon>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.26z"/>
    </SvgIcon>
  );

  const FarcasterIcon = () => (
    <SvgIcon>
      <path d="M21.5 5.5h-3v13h-3v-8.5h-3v8.5h-3v-13h-3v15h15v-15z"/>
      <path d="M5.5 2.5h13v2h-13z"/>
    </SvgIcon>
  );

  const TwitchIcon = () => (
    <SvgIcon>
      <path d="M2.149 0L.537 4.119v15.581h5.731V24h3.224l3.045-3.3h4.657l6.269-6.119V0H2.149zm19.164 13.119L18.149 16.12h-5.731l-3.045 3.3H6.149V3.3h15.164v9.819zM17.164 5.4v6.12h-2.149V5.4h2.149zm-5.731 6.12h2.149V5.4h-2.149v6.12z"/>
    </SvgIcon>
  );

  const TelegramIcon = () => (
    <SvgIcon>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
    </SvgIcon>
  );

  const DiscordIcon = () => (
    <SvgIcon>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </SvgIcon>
  );
  
  const socialLinks = [
    { url: website, icon: <LanguageIcon />, label: 'Website', color: BRAND_COLORS.website },
    { url: instagram, icon: <InstagramIcon />, label: 'Instagram', color: BRAND_COLORS.instagram },
    { url: twitter, icon: <TwitterIcon />, label: 'Twitter', color: BRAND_COLORS.twitter },
    { url: tiktok, icon: <TikTokIcon />, label: 'TikTok', color: BRAND_COLORS.tiktok },
    { url: youtube, icon: <YouTubeIcon />, label: 'YouTube', color: BRAND_COLORS.youtube },
    { url: farcaster, icon: <FarcasterIcon />, label: 'Farcaster', color: BRAND_COLORS.farcaster },
    { url: telegram, icon: <TelegramIcon />, label: 'Telegram', color: BRAND_COLORS.telegram },
    { url: discord, icon: <DiscordIcon />, label: 'Discord', color: BRAND_COLORS.discord },
    { url: blog, icon: <BookIcon />, label: 'Blog', color: BRAND_COLORS.blog },
    { url: stream, icon: <TwitchIcon />, label: 'Streaming', color: BRAND_COLORS.stream }
  ].filter(link => link.url);
  
  if (socialLinks.length === 0 && !isVerified) return null;
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {socialLinks.length > 0 && (
        <Box 
          ref={containerRef}
          sx={{ 
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            
            background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
            borderRadius: '36px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            p: 2,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1
          }}
        >
          {socialLinks.map((link, index) => (
            <Tooltip key={index} title={link.label}>
              <IconButton 
                component="a" 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{
                  backgroundColor: isLightBg ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  color: isLightBg && link.color === '#000000' ? '#333333' : link.color,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isLightBg ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {link.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}

    </Box>
  );
}