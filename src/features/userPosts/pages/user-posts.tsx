import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { Box, Container, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useContrastColors } from '@/features/profiles/hooks/useContrastColors';
import { getBackgroundStyle } from '@/features/profiles/utils/backgroundUtils';
import ProfileNavbar from '@/features/profiles/components/ProfileNavbar';
import TextPost from '@/features/userPosts/components/posts/TextPost';
import ImagePost from '@/features/userPosts/components/posts/ImagePost';
import VideoPost from '@/features/userPosts/components/posts/VideoPost';
import { userPostsApi, PostMedia, PostsApiParams } from '../api/user-posts.api';
import ProfileLoading from '@/features/profiles/components/ProfileLoading';
import { userAuth } from '@/lib/userAuth';
import { enhancedUserPostsApi, EnhancedPostsApiParams } from '../api/user-posts-enhanced.api';

interface UserPostsPageProps {
  // These props can be overridden, but will default to API data
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
}

export default function UserPostsPage({ 
  backgroundColor: propBackgroundColor = null, 
  backgroundImageUrl: propBackgroundImageUrl = null,
  textColor: propTextColor = null 
}: UserPostsPageProps) {
  const { displayLink } = useParams({ from: '/p/$displayLink' });
  const [userAccessLevel, setUserAccessLevel] = useState<'none' | 'partial' | 'full'>('none');
  const [isAuthenticated] = useState(() => userAuth.getAuthState().isAuthenticated);
  
  // Check user authentication and access level
  const checkUserAccess = useCallback(async () => {
    const authState = userAuth.getAuthState();
    
    if (!authState.isAuthenticated) {
      setUserAccessLevel('none');
      return;
    }
    
    // Refresh permissions on page load (good for recent purchases)
    await enhancedUserPostsApi.refreshUserPermissions();
    
    const hasAccess = userAuth.hasAccessToCreator(displayLink as string);
    setUserAccessLevel(hasAccess ? 'full' : 'partial');
  }, [displayLink]);

  useEffect(() => {
    checkUserAccess();
  }, [checkUserAccess]);

  // Enhanced infinite query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['enhanced-user-posts', displayLink, userAccessLevel],
    queryFn: ({ pageParam = 0 }) => {
      const params: EnhancedPostsApiParams = {
        displayLink: displayLink as string,
        offset: pageParam,
        limit: 7,
        tierFilter: 'all'
      };
      return enhancedUserPostsApi.getPosts(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return enhancedUserPostsApi.hasMorePosts(lastPage)
        ? allPages.length * 7 // Simple offset calculation
        : undefined;
    },
    enabled: !!displayLink,
  });

  // Get account info - the API might be returning data directly, not nested
  const accountInfo = data?.pages[0]?.account || null;

  // Add debugging to see what's happening
  console.log('🔍 User Posts Debug:', {
    hasData: !!data,
    hasPagesData: !!data?.pages,
    hasFirstPage: !!data?.pages[0],
    hasAccount: !!data?.pages[0]?.account,
    accountInfo: accountInfo,
    displayName: accountInfo?.display_name,
    displayLink: displayLink,
    status: status
  });

  // Enhanced background handling using the utility
  const finalBackgroundImageUrl = propBackgroundImageUrl || 
    accountInfo?.background_image_url || 
    accountInfo?.background_image_signed_url || 
    null;
    
  const finalBackgroundColor = propBackgroundColor || 
    accountInfo?.background_color || 
    null;
    
  const textColor = propTextColor || 
    accountInfo?.background_text_color || 
    '#ffffff';
  
  // Get colors based on the background (update this to use final values)
  const { 
    uiBorderColor,
    uiBackgroundColor 
  } = useContrastColors(finalBackgroundColor, finalBackgroundImageUrl);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Render post based on type
  const renderPost = (post: PostMedia) => {
    const postProps = {
      post,
      accountInfo,
      backgroundColor: finalBackgroundColor,
      backgroundImageUrl: finalBackgroundImageUrl,
      textColor
    };

    // Determine post type based on content and media
    // Video/Audio posts (including embeds)
    if (
      post.media_type === 'video' || 
      post.media_type === 'audio' ||
      post.video_link_url || 
      (post.media_url && post.media_url.match(/\.(mp4|webm|ogg|mov|mp3|wav|aac)$/i))
    ) {
      return <VideoPost key={post.post_id} {...postProps} />;
    }
    
    // Image posts
    if (
      post.media_type === 'image' || 
      (post.media_url && post.media_url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
    ) {
      return <ImagePost key={post.post_id} {...postProps} />;
    }
    
    // Default to text post (includes posts with only HTML content)
    return <TextPost key={post.post_id} {...postProps} />;
  };

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  // Get total posts from pagination (fallback to loaded posts count)
  const totalPosts = data?.pages[0]?.pagination?.total_posts || allPosts.length;

  // Get access level display text
  const getAccessLevelText = () => {
    switch (userAccessLevel) {
      case 'full':
        return 'Premium Access • Full Content';
      case 'partial':
        return 'Connected • Public Content';
      case 'none':
      default:
        return 'Public Content';
    }
  };

  // Get access level color
  const getAccessLevelColor = () => {
    switch (userAccessLevel) {
      case 'full':
        return 'rgba(76, 175, 80, 0.8)'; // Green
      case 'partial':
        return 'rgba(255, 152, 0, 0.8)'; // Orange
      case 'none':
      default:
        return 'rgba(96, 125, 139, 0.8)'; // Grey
    }
  };

  if (status === 'pending') {
    return <ProfileLoading />;
  }

  if (status === 'error') {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: getBackgroundStyle(finalBackgroundImageUrl, finalBackgroundColor, true, 'rgba(0, 0, 0, 0.3)')
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 400,
            backgroundColor: 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Failed to load posts. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: getBackgroundStyle(
        finalBackgroundImageUrl,
        finalBackgroundColor,
        true, // useRandomFallback = true
        'rgba(0, 0, 0, 0.2)' // overlay for better text readability
      ),
      paddingTop: { xs: '64px', md: '72px' }
    }}>
      {/* Profile Navbar - Always show, enhance with data when available */}
      <ProfileNavbar
        backgroundColor={finalBackgroundColor}
        backgroundImageUrl={finalBackgroundImageUrl}
        textColor={textColor}
        displayLink={displayLink as string}
        displayName={accountInfo?.display_name || (displayLink as string)}
        bio="Check out my latest posts"
        profileImageSignedUrl={accountInfo?.profile_image_url || null}
        accountType="creator"
      />

      {/* Posts Container */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Enhanced Page Header with Access Level */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              color: textColor,
              textShadow: '-.4px -.4px 0 #000, .4px -.4px 0 #000, -.4px .4px 0 #000, .4px .4px 0 #000',
              mb: 1
            }}
          >
            {accountInfo?.display_name || displayLink}'s Posts
          </Typography>
          
          {/* Only show post count and access level if we have account data */}
          {accountInfo && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: `${textColor}CC`,
                  textShadow: '-.2px -.2px 0 #000, .2px -.2px 0 #000, -.2px .2px 0 #000, .2px .2px 0 #000'
                }}
              >
                {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
              </Typography>
              
              <Chip
                label={getAccessLevelText()}
                size="small"
                sx={{
                  backgroundColor: getAccessLevelColor(),
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          )}
        </Box>

        {/* Posts List */}
        <Box>
          {allPosts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography
                variant="h5"
                sx={{
                  color: textColor,
                  textShadow: '-.2px -.2px 0 #000, .2px -.2px 0 #000, -.2px .2px 0 #000, .2px .2px 0 #000',
                  mb: 2
                }}
              >
                No posts yet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: `${textColor}CC`,
                  textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
                }}
              >
                Check back later for new content!
              </Typography>
            </Box>
          ) : (
            <>
              {allPosts.map(renderPost)}
              
              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={40} sx={{ color: textColor }} />
                </Box>
              )}
              
              {/* End of posts indicator */}
              {!hasNextPage && allPosts.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: `${textColor}80`,
                      textShadow: '-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000, .1px .1px 0 #000'
                    }}
                  >
                    You've reached the end! 🎉
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
