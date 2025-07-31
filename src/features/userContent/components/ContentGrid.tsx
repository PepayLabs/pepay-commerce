import React from 'react';
import { Grid, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ContentItem, ContentAccount } from '../types/content.types';
import ContentCard from './ContentCard';
import ContentViewerModal from './ContentViewerModal';
import { useContentViewer } from '../hooks/useContentViewer';

interface ContentGridProps {
  content: ContentItem[];
  account: ContentAccount;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPlay?: (content: ContentItem) => void;
  onPurchaseClick?: (content: ContentItem, account: ContentAccount) => void;
  textColor?: string;
  uiBackgroundColor?: string;
  uiBorderColor?: string;
}

export default function ContentGrid({
  content,
  account,
  loading = false,
  hasMore = false,
  onLoadMore,
  onPlay,
  onPurchaseClick,
  textColor,
  uiBackgroundColor,
  uiBorderColor,
}: ContentGridProps) {
  const theme = useTheme();
  
  // Modal management at grid level
  const { 
    openContent, 
    isOpen, 
    currentContent, 
    closeContent, 
    likedContent, 
    toggleLike, 
    handleShare, 
    handleDownload 
  } = useContentViewer();

  if (loading && content.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress sx={{ color: textColor || theme.palette.primary.main }} />
      </Box>
    );
  }

  if (content.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: textColor || theme.palette.text.primary,
            fontWeight: 600,
          }}
        >
          No Content Available
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: textColor ? `${textColor}CC` : theme.palette.text.secondary,
            maxWidth: 400,
          }}
        >
          This creator hasn't published any content yet. Check back later for updates!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Grid container spacing={3}>
          {content.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.content_id}>
              <ContentCard
                content={item}
                account={account}
                onPlay={onPlay}
                onPurchaseClick={onPurchaseClick}
                onViewContent={openContent}
                textColor={textColor}
                uiBackgroundColor={uiBackgroundColor}
                uiBorderColor={uiBorderColor}
              />
            </Grid>
          ))}
        </Grid>

        {/* Load More Button */}
        {hasMore && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={onLoadMore}
              disabled={loading}
              sx={{
                borderColor: textColor || theme.palette.primary.main,
                color: textColor || theme.palette.primary.main,
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: textColor ? `${textColor}15` : `${theme.palette.primary.main}15`,
                  borderColor: textColor || theme.palette.primary.main,
                },
                '&:disabled': {
                  opacity: 0.6,
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </Box>
        )}
      </Box>

      {/* Single Modal Instance */}
      <ContentViewerModal
        open={isOpen}
        content={currentContent}
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