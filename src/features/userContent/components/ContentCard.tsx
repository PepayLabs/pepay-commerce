import React, { useState } from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Chip, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { ContentItem, ContentAccount } from '../types/content.types';
import { getContentCoverFallback, getGlassmorphismStyle } from '../utils/fallbackUtils';
import ContentViewerModal from './ContentViewerModal';
import { useContentViewer } from '../hooks/useContentViewer';

interface ContentCardProps {
  content: ContentItem;
  account: ContentAccount;
  onPlay?: (content: ContentItem) => void;
  onPurchaseClick?: (content: ContentItem, account: ContentAccount) => void;
  textColor?: string;
  uiBackgroundColor?: string;
  uiBorderColor?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getContentIcon = (type: string, size: number = 24) => {
  const iconProps = { sx: { fontSize: size, color: 'white' } };
  switch (type) {
    case 'video':
      return <PlayArrowIcon {...iconProps} />;
    case 'audio':
      return <AudiotrackIcon {...iconProps} />;
    case 'image':
      return <ImageIcon {...iconProps} />;
    default:
      return <ImageIcon {...iconProps} />;
  }
};

export default function ContentCard({
  content,
  account,
  onPlay,
  onPurchaseClick,
  textColor,
  uiBackgroundColor,
  uiBorderColor,
}: ContentCardProps) {
  const theme = useTheme();
  const fallback = getContentCoverFallback(content);
  const { openContent, isOpen, currentContent, closeContent, likedContent, toggleLike, handleShare, handleDownload } = useContentViewer();

  const handleCardClick = () => {
    if (content.has_access || content.is_purchased) {
      openContent(content);
    } else {
      onPurchaseClick?.(content, account);
    }
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPurchaseClick) {
      onPurchaseClick(content, account);
    }
  };

  const hasAccess = content.has_access || content.is_purchased;

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          ...getGlassmorphismStyle(),
          border: `1px solid ${uiBorderColor || 'rgba(255, 255, 255, 0.1)'}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        }}
        onClick={handleCardClick}
      >
        {/* Thumbnail with Beautiful Fallbacks */}
        <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
          {content.cover_image_url ? (
            <CardMedia
              component="img"
              image={content.cover_image_url}
              alt={content.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            // Beautiful fallback with gradient and icon
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: fallback.backgroundImage,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  opacity: 0.3,
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                {getContentIcon(content.content_type, 48)}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mt: 1,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {content.content_type}
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Content Type Icon */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 1,
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backdropFilter: 'blur(8px)',
            }}
          >
            {getContentIcon(content.content_type, 16)}
            {content.preview_seconds && content.preview_seconds > 0 && (
              <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                {formatDuration(content.preview_seconds)}
              </Typography>
            )}
          </Box>

          {/* Private Content Overlay */}
          {!hasAccess && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  borderRadius: '50%',
                  p: 2,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <LockIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                ${content.price}
              </Typography>
            </Box>
          )}

          {/* Featured Badge */}
          {content.is_featured && (
            <Chip
              label="Featured"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          )}
        </Box>

        {/* Content Info */}
        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: textColor || theme.palette.text.primary,
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {content.title}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: textColor ? `${textColor}CC` : theme.palette.text.secondary,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            }}
          >
            {content.short_metadata || content.description}
          </Typography>

          {/* Stats and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityIcon sx={{ fontSize: 16, color: textColor ? `${textColor}80` : theme.palette.text.secondary }} />
                <Typography variant="caption" sx={{ color: textColor ? `${textColor}80` : theme.palette.text.secondary }}>
                  {formatNumber(content.view_count)}
                </Typography>
              </Box>
              {content.purchase_count > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ShoppingCartIcon sx={{ fontSize: 16, color: textColor ? `${textColor}80` : theme.palette.text.secondary }} />
                  <Typography variant="caption" sx={{ color: textColor ? `${textColor}80` : theme.palette.text.secondary }}>
                    {formatNumber(content.purchase_count)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Purchase Button for Private Content */}
            {!hasAccess && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ShoppingCartIcon />}
                onClick={handlePurchaseClick}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                ${content.price}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <ContentViewerModal
        open={isOpen}
        content={currentContent}
        account={account}
        onClose={closeContent}
        onLike={toggleLike}
        onShare={handleShare}
        onDownload={handleDownload}
        isLiked={likedContent.has(currentContent?.content_id || '')}
        canDownload={currentContent?.has_access || currentContent?.is_purchased}
      />
    </>
  );
}