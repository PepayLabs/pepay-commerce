import React, { useState } from 'react';
import { Box, Typography, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PostMedia } from '@/features/userPosts/api/user-posts.api';
import PostContainer from './PostContainer';

interface ImagePostProps {
  post: PostMedia;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
}

export default function ImagePost({ 
  post, 
  backgroundColor = null, 
  backgroundImageUrl = null,
  textColor = null 
}: ImagePostProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const renderContent = () => {
    if (post.is_preview && post.subscriber_content_type === 'image') {
      return (
        <Box>
          {post.content && (
            <Typography
              variant="body1"
              sx={{
                color: textColor || '#ffffff',
                textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000',
                lineHeight: 1.6,
                mb: 2
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
          <Box sx={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            mb: 2,
            filter: 'blur(8px)',
            opacity: 0.6
          }}>
            <img
              src={post.media_url}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'cover'
              }}
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <Typography variant="h6" color="white" fontWeight={600}>
                🔒 Premium Content
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
              {post.preview_message || 'Subscribe to view full image'}
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        {post.content && (
          <Typography
            variant="body1"
            sx={{
              color: textColor || '#ffffff',
              textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000',
              lineHeight: 1.6,
              mb: 2
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
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
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={post.media_url}
            alt={post.display_name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '600px',
              objectFit: 'cover'
            }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <>
      <PostContainer 
        post={post} 
        backgroundColor={backgroundColor}
        backgroundImageUrl={backgroundImageUrl}
        textColor={textColor}
      >
        {renderContent()}
      </PostContainer>

      {/* Image Lightbox */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={post.media_url}
            alt={post.display_name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Dialog>
    </>
  );
}