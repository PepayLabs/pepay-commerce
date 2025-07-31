import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import StarIcon from '@mui/icons-material/Star';
import { ContentPreviewProps } from '../types/purchase.types';

const getContentIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayArrowIcon sx={{ fontSize: 16 }} />;
    case 'audio':
      return <AudiotrackIcon sx={{ fontSize: 16 }} />;
    case 'image':
      return <ImageIcon sx={{ fontSize: 16 }} />;
    default:
      return <ImageIcon sx={{ fontSize: 16 }} />;
  }
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function ContentPreview({
  content,
  onPreviewClick,
  textColor,
  uiBackgroundColor,
  uiBorderColor,
}: ContentPreviewProps) {
  const theme = useTheme();

  // Use white text since background is dark
  const actualTextColor = '#ffffff';
  const subtleTextColor = 'rgba(255, 255, 255, 0.8)';

  return (
    <Box
      sx={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
        borderRadius: '36px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)',
        },
      }}
    >
      {/* Content Image */}
      <Box 
        sx={{ 
          position: 'relative',
          aspectRatio: '16/9',
          cursor: onPreviewClick ? 'pointer' : 'default',
          overflow: 'hidden',
          borderRadius: '36px 36px 0 0',
        }}
        onClick={onPreviewClick}
      >
        <img
          src={content.cover_image_url}
          alt={content.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (onPreviewClick) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (onPreviewClick) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        />

        {/* Content Type Badge */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '20px',
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {getContentIcon(content.content_type)}
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'white', 
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {content.content_type}
          </Typography>
          {content.preview_seconds > 0 && (
            <>
              <Box sx={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                {formatDuration(content.preview_seconds)}
              </Typography>
            </>
          )}
        </Box>

        {/* Featured Badge */}
        {content.is_featured && (
          <Chip
            icon={<StarIcon sx={{ fontSize: 14 }} />}
            label="Featured"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: '20px',
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        )}

        {/* Expand Preview Button */}
        {onPreviewClick && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: theme.palette.text.primary,
              width: 36,
              height: 36,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPreviewClick();
            }}
          >
            <FullscreenIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Content Info */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: actualTextColor,
            mb: 2,
            fontSize: '1.5rem',
          }}
        >
          {content.title}
        </Typography>
        
        {(content.short_metadata || content.description) && (
          <Typography
            variant="body2"
            sx={{
              color: subtleTextColor,
              lineHeight: 1.5,
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {content.short_metadata || content.description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}