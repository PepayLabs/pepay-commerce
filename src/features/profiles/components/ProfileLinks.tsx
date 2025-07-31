import { Box, Typography, Link, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContrastColors } from '../hooks/useContrastColors';
import { ProfileLink } from '../types/profile.types';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from 'react';

interface ProfileLinksProps {
  links: ProfileLink[];
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  linkSectionTitle?: string;
  textColor?: string | null;
}

export default function ProfileLinks({ 
  links, 
  backgroundColor = null, 
  backgroundImageUrl = null,
  linkSectionTitle = "FEATURED",
  textColor = null
}: ProfileLinksProps) {
  const theme = useTheme();
  const [rotationIndex, setRotationIndex] = useState(0);
  
  // Get appropriate colors based on background
  const { uiBorderColor, uiBackgroundColor, subtleTextColor } = 
    useContrastColors(backgroundColor, backgroundImageUrl);
  
  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!links || links.length <= 1) return;
    
    const interval = setInterval(() => {
      setRotationIndex(prev => (prev + 1) % links.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [links]);

  // Add this useEffect to preload images
  useEffect(() => {
    if (!links || links.length === 0) return;
    
    // Preload all images
    links.forEach(link => {
      if (link.signed_image_url) {
        const img = new Image();
        img.src = link.signed_image_url;
      }
    });
  }, [links]);

  // Don't show component if no links OR if no meaningful content
  if (!links || links.length === 0) {
    return null;
  }

  // Check if any links have images or titles - if not, don't show component
  const hasContent = links.some(link => link.signed_image_url || link.title);
  if (!hasContent) {
    return null;
  }

  // Create rotated links array
  const rotatedLinks = [...links.slice(rotationIndex), ...links.slice(0, rotationIndex)];
  
  return (
    <Box sx={{ 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      borderRadius: '46px',
      border: `1px solid ${uiBorderColor}`,
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 3,
      position: 'relative'
    }}>
      {/* Header with Info Icon */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        backgroundColor: uiBackgroundColor,
        borderRadius: theme.shape.borderRadius,
        p: 2,
      }}>
        <Typography variant="h5" fontWeight={600} color={textColor}>
          {linkSectionTitle}
        </Typography>
        <Tooltip 
          title="Featured content and links from your favorite creator"
          placement="top"
          arrow
        >
          <InfoIcon 
            sx={{ 
              ml: 1,
              color: subtleTextColor,
              fontSize: '18px',
              cursor: 'help',
              '&:hover': {
                color: textColor,
              }
            }} 
          />
        </Tooltip>
      </Box>

      {/* Horizontal scrolling container */}
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 0,
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 6,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
          }
        }
      }}>
        {rotatedLinks.map((link, index) => (
          <Link 
            key={link.link_id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{ 
              flexShrink: 0,
              width: 280,
              transition: 'all 0.5s ease-in-out',
            }}
          >
            <Box sx={{ 
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              backgroundColor: 'transparent',
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(31, 38, 135, 0.25)',
              }
            }}>
              {/* Image Section */}
              {link.signed_image_url && (
                <Box 
                  component="img"
                  src={link.signed_image_url}
                  alt={link.title}
                  sx={{ 
                    width: '100%',
                    height: 160,
                    objectFit: 'cover',
                    display: 'block',
                    borderBottomLeftRadius: link.title ? '0px' : '16px',
                    borderBottomRightRadius: link.title ? '0px' : '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  }}
                />
              )}
              
              {/* Text Section - Only show if title exists */}
              {link.title && (
                <Box sx={{ 
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                  borderTop: link.signed_image_url ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px',
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: textColor || 'black',
                      fontWeight: 600,
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {link.title}
                  </Typography>
                </Box>
              )}
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
}