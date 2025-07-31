import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { format } from 'date-fns';
import PushPinIcon from '@mui/icons-material/PushPin';
import { PostMedia } from '@/features/userPosts/api/user-posts.api';

interface PostContainerProps {
  post: PostMedia;
  accountInfo?: any;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
  children: React.ReactNode;
}

// Function to get a consistent fallback avatar based on display name
const getFallbackAvatar = (displayName: string): string => {
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

export default function PostContainer({ 
  post, 
  accountInfo,
  backgroundColor = null, 
  backgroundImageUrl = null,
  textColor = null,
  children 
}: PostContainerProps) {
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Use actual profile image first, then fallback - handle both field name variations
  const avatarSrc = accountInfo?.profile_image_url || 
                   accountInfo?.profile_image_signed_url || 
                   getFallbackAvatar(post.display_name);

  return (
    <Box sx={{
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      backdropFilter: 'blur(50px)',
      WebkitBackdropFilter: 'blur(50px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 3,
      mb: 3,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)',
      }
    }}>
      
      {/* Pinned Badge */}
      {post.is_pinned && (
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2
        }}>
          <Chip
            icon={<PushPinIcon sx={{ fontSize: '16px !important' }} />}
            label="Pinned"
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 215, 0, 0.9)',
              color: '#000',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': {
                color: '#000'
              }
            }}
          />
        </Box>
      )}

      {/* Post Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        pr: post.is_pinned ? 6 : 0
      }}>
        <Avatar
          src={avatarSrc}
          alt={post.display_name}
          sx={{
            width: 40,
            height: 40,
            mr: 2,
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              color: textColor || '#ffffff',
              textShadow: '-.2px -.2px 0 #000, .2px -.2px 0 #000, -.2px .2px 0 #000, .2px .2px 0 #000'
            }}
          >
            {post.display_name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: textColor ? `${textColor}CC` : 'rgba(255, 255, 255, 0.8)',
              textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
            }}
          >
            {formatDate(post.published_at)}
          </Typography>
        </Box>
        
        {/* Post Tier Badge */}
        <Chip
          label={post.post_tier === 'free' ? 'Free' : 'Premium'}
          size="small"
          sx={{
            backgroundColor: post.post_tier === 'free' 
              ? 'rgba(76, 175, 80, 0.8)' 
              : 'rgba(255, 152, 0, 0.8)',
            color: '#fff',
            fontWeight: 500,
            fontSize: '0.7rem'
          }}
        />
      </Box>

      {/* Post Content */}
      {children}
    </Box>
  );
}