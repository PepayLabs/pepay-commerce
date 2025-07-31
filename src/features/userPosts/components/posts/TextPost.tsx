import { Box, Typography } from '@mui/material';
import { PostMedia } from '@/features/userPosts/api/user-posts.api';
import PostContainer from './PostContainer';

interface TextPostProps {
  post: PostMedia;
  accountInfo?: any;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
}

export default function TextPost({ 
  post, 
  accountInfo,
  backgroundColor = null, 
  backgroundImageUrl = null,
  textColor = null 
}: TextPostProps) {
  
  const renderContent = () => {
    if (post.is_preview && post.subscriber_content_type === 'text') {
      return (
        <Box>
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
              '& ul, & ol': { pl: 2, mb: 1 },
              '& li': { mb: 0.5 },
              '& a': { 
                color: '#2196F3',
                textDecoration: 'underline',
                fontWeight: 500,
                '&:hover': { 
                  color: '#1976D2',
                  textDecoration: 'underline'
                }
              },
              '& strong': {
                fontWeight: 700,
                color: textColor || '#ffffff'
              },
              '& em': {
                fontStyle: 'italic',
                color: textColor || '#ffffff'
              }
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
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
              {post.preview_message || 'Subscribe to read more'}
            </Typography>
          </Box>
        </Box>
      );
    }

    return (
      <Typography
        variant="body1"
        sx={{
          color: textColor || '#ffffff',
          textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000',
          lineHeight: 1.6,
          '& p': { mb: 1 },
          '& h1, & h2, & h3, & h4, & h5, & h6': { 
            mb: 1, 
            fontWeight: 'bold',
            color: textColor || '#ffffff',
            textShadow: '-.2px -.2px 0 #000, .2px -.2px 0 #000, -.2px .2px 0 #000, .2px .2px 0 #000'
          },
          '& ul, & ol': { pl: 2, mb: 1 },
          '& li': { mb: 0.5 },
          '& a': { 
            color: '#2196F3',
            textDecoration: 'underline',
            fontWeight: 500,
            '&:hover': { 
              color: '#1976D2',
              textDecoration: 'underline'
            }
          },
          '& strong': {
            fontWeight: 700,
            color: textColor || '#ffffff'
          },
          '& em': {
            fontStyle: 'italic',
            color: textColor || '#ffffff'
          },
          '& blockquote': {
            borderLeft: `4px solid ${textColor || '#ffffff'}`,
            paddingLeft: 2,
            marginLeft: 0,
            fontStyle: 'italic',
            opacity: 0.9
          }
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    );
  };

  return (
    <PostContainer 
      post={post} 
      accountInfo={accountInfo}
      backgroundColor={backgroundColor}
      backgroundImageUrl={backgroundImageUrl}
      textColor={textColor}
    >
      {renderContent()}
    </PostContainer>
  );
}