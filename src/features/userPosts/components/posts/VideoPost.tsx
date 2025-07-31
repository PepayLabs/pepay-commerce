import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { PostMedia } from '@/features/userPosts/api/user-posts.api';
import PostContainer from './PostContainer';
import YouTubeEmbed from '../embeds/YouTubeEmbed';
import TikTokEmbed from '../embeds/TikTokEmbed';
import TwitterEmbed from '../embeds/TwitterEmbed';
import InstagramEmbed from '../embeds/InstagramEmbed';
import VimeoEmbed from '../embeds/VimeoEmbed';
import BrandedVideoPlayer from '../BrandedVideoPlayer';

interface VideoPostProps {
  post: PostMedia;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
}

export default function VideoPost({ 
  post, 
  backgroundColor = null, 
  backgroundImageUrl = null,
  textColor = null 
}: VideoPostProps) {
  const [isMuted, setIsMuted] = useState(true);

  const getPlatformIcon = (platform?: string) => {
    const icons = {
      youtube: '🎥',
      tiktok: '🎵',
      twitter: '🐦',
      instagram: '📸',
      vimeo: '🎬'
    };
    return icons[platform as keyof typeof icons] || '▶️';
  };

  const renderContentText = () => {
    if (!post.content) return null;
    
    return (
      <Typography
        variant="body1"
        sx={{
          color: textColor || '#ffffff',
          textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000',
          lineHeight: 1.6,
          mb: 2,
          '& p': { mb: 1 },
          '& h1, & h2, & h3, & h4, & h5, & h6': { 
            mb: 1, 
            fontWeight: 'bold',
            color: textColor || '#ffffff',
            textShadow: '-.2px -.2px 0 #000, .2px -.2px 0 #000, -.2px .2px 0 #000, .2px .2px 0 #000'
          },
          '& a': { 
            color: '#2196F3',
            textDecoration: 'underline',
            fontWeight: 500,
            '&:hover': { 
              color: '#1976D2'
            }
          }
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    );
  };

  const renderEmbed = () => {
    if (!post.video_link_url) return null;

    const platformProps = {
      url: post.video_link_url,
      title: `${post.display_name}'s ${post.video_link_platform} post`
    };

    switch (post.video_link_platform) {
      case 'youtube':
        return <YouTubeEmbed {...platformProps} />;
      case 'tiktok':
        return <TikTokEmbed {...platformProps} />;
      case 'x':
        return <TwitterEmbed {...platformProps} />;
      case 'instagram':
        return <InstagramEmbed {...platformProps} />;
      case 'vimeo':
        return <VimeoEmbed {...platformProps} />;
      default:
        return (
          <Box
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
            onClick={() => window.open(post.video_link_url, '_blank')}
          >
            <Box sx={{
              position: 'relative',
              backgroundColor: '#000',
              aspectRatio: '16/9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconButton
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#000',
                  width: 64,
                  height: 64,
                  '&:hover': {
                    backgroundColor: '#fff',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>
          </Box>
        );
    }
  };

  const renderContent = () => {
    if (post.is_preview && post.subscriber_content_type === 'video') {
      return (
        <Box>
          {renderContentText()}
          <Box sx={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            mb: 2,
            backgroundColor: '#000',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{
              textAlign: 'center',
              color: 'white'
            }}>
              <Typography variant="h4" sx={{ mb: 1 }}>
                🔒
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                Premium Video Content
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                HD Quality Video
              </Typography>
            </Box>
          </Box>
          <Box sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            textAlign: 'center'
          }}>
            <Typography
              variant="body2"
              sx={{
                color: '#FFA726',
                fontWeight: 500,
                fontStyle: 'italic'
              }}
            >
              {post.preview_message || 'Subscribe to watch full video'}
            </Typography>
          </Box>
        </Box>
      );
    }

    // External video embed
    if (post.video_link_url) {
      return (
        <Box>
          {renderContentText()}
          {post.video_link_platform && (
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<span>{getPlatformIcon(post.video_link_platform)}</span>}
                label={post.video_link_platform.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: 'rgba(96, 125, 139, 0.8)',
                  color: '#fff',
                  fontWeight: 500
                }}
              />
            </Box>
          )}
          {renderEmbed()}
        </Box>
      );
    }

    // Direct video file
    if (post.media_url) {
      return (
        <Box>
          {renderContentText()}
          <BrandedVideoPlayer
            src={post.media_url}
            title={post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 50) : 'Video Post'}
            creatorName={post.display_name}
            textColor={textColor}
            onProgress={(progress) => {
              // Optional: Track video progress for analytics
              if (progress > 0.5) {
                console.log('Video halfway watched');
              }
            }}
            onEnded={() => {
              // Optional: Handle video completion
              console.log('Video completed by', post.display_name);
            }}
          />
        </Box>
      );
    }

    // Audio file
    if (post.media_type === 'audio') {
      return (
        <Box>
          {renderContentText()}
          <Box sx={{
            p: 3,
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography
              variant="h6"
              sx={{
                color: textColor || '#ffffff',
                textShadow: '-.2px -.2px 0 #000, .2px -.2px 0 #000, -.2px .2px 0 #000, .2px .2px 0 #000',
                mb: 2,
                textAlign: 'center'
              }}
            >
              🎵 Audio Content
            </Typography>
            <audio
              src={post.media_url}
              controls
              style={{ width: '100%' }}
            />
          </Box>
        </Box>
      );
    }

    return null;
  };

  return (
    <PostContainer 
      post={post} 
      backgroundColor={backgroundColor}
      backgroundImageUrl={backgroundImageUrl}
      textColor={textColor}
    >
      {renderContent()}
    </PostContainer>
  );
}