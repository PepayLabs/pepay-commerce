import  { useState, useEffect } from 'react';
import { Box, Container, Typography, Avatar, Button, Alert, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from '@tanstack/react-router';
import ProfileNavbar from '@/features/profiles/components/ProfileNavbar';
import { useContrastColors } from '@/features/profiles/hooks/useContrastColors';
import { fetchContent } from '../api/contentService';
import {  ContentItem, ContentFilters as FilterType, UnifiedContentResponse } from '../types/content.types';
import ContentGrid from '../components/ContentGrid';
import ContentFilters from '../components/ContentFilters';
import PurchaseModal from '@/features/purchaseModal/components/PurchaseModal';
import { usePurchaseModal } from '@/features/purchaseModal/hooks/usePurchaseModal';
import { userAuth } from '@/lib/userAuth';
import { useToast } from '@/hooks/use-toast';
import { getProfileImageFallback, getProfileBackgroundFallback } from '../utils/fallbackUtils';

// Function 

export default function ContentPage() {
  const { displayLink } = useParams({ from: '/c/$displayLink' });
  const navigate = useNavigate();
  const theme = useTheme();
  const { toast } = useToast();
  
  const [contentData, setContentData] = useState<UnifiedContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedPurchaseStatus, setSelectedPurchaseStatus] = useState<string | null>(null);
  const [authState, setAuthState] = useState(userAuth.getAuthState());

  // Purchase Modal State
  const { isOpen, selectedContent, selectedAccount, openModal, closeModal } = usePurchaseModal();

  // Add debugging
  console.log('🔍 ContentPage Modal State:', {
    isOpen,
    hasSelectedContent: !!selectedContent,
    hasSelectedAccount: !!selectedAccount
  });

  // Use background_text_color directly as the text color
  const profileTextColor = contentData?.account?.background_text_color;
  
  // Get colors based on the background (for UI elements, not text)
  const { 
    uiBorderColor,
    uiBackgroundColor 
  } = useContrastColors(
    null, // Don't pass background_text_color here
    contentData?.account?.background_image_url
  );

  // Use the profile's text color directly
  const textColor = profileTextColor || '#ffffff';
  const subtleTextColor = profileTextColor ? `${profileTextColor}CC` : '#ffffff';

  // Update auth state
  useEffect(() => {
    const updateAuthState = () => {
      setAuthState(userAuth.getAuthState());
    };
    
    updateAuthState();
    window.addEventListener('storage', updateAuthState);
    
    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  // Fetch initial content
  useEffect(() => {
    const loadContent = async () => {
      if (!displayLink) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const filters: FilterType = {
          content_type: selectedFilter || undefined,
          purchase_status: selectedPurchaseStatus || undefined,
          limit: 9,
          offset: 0,
        };
        
        const data = await fetchContent(displayLink, filters);
        setContentData(data);
        console.log('✅ Content loaded - Private API:', data.isPrivateResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        
        if (errorMessage === 'Profile not found') {
          navigate({ to: '/' });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [displayLink, selectedFilter, selectedPurchaseStatus, navigate]);

  // Load more content
  const handleLoadMore = async () => {
    if (!contentData || !displayLink) return;
    
    setLoadingMore(true);
    
    try {
      const filters: FilterType = {
        content_type: selectedFilter || undefined,
        purchase_status: selectedPurchaseStatus || undefined,
        limit: 9,
        offset: contentData.pagination.next_offset,
      };
      
      const newData = await fetchContent(displayLink, filters);
      
      setContentData(prev => prev ? {
        ...prev,
        content: [...prev.content, ...newData.content],
        pagination: newData.pagination,
      } : newData);
    } catch (err) {
      toast({
        title: "Error loading more content",
        description: err instanceof Error ? err.message : "Failed to load more content",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle content play
  const handlePlay = (content: ContentItem) => {
    // TODO: Implement content player
    console.log('Playing content:', content);
    toast({
      title: "Content Player",
      description: "Content player will be implemented in the next phase",
      variant: "default",
    });
  };

  // Handle content purchase from modal
  const handlePurchase = async (content: ContentItem) => {
    console.log('Purchasing content:', content);
    // Don't close the modal here - let the PurchaseModal handle its own flow
    // The modal will close itself after successful payment or user cancellation
  };

  // Handle sign in from modal
  const handleSignIn = () => {
    navigate({ to: '/user-sign-in' });
  };

  // Calculate content counts for filters
  const getContentCounts = () => {
    if (!contentData) return undefined;
    
    return {
      total: contentData.pagination.total_content,
      image: contentData.content.filter(c => c.content_type === 'image').length,
      video: contentData.content.filter(c => c.content_type === 'video').length,
      audio: contentData.content.filter(c => c.content_type === 'audio').length,
    };
  };

  // Client-side filtering for unauthenticated users
  const getFilteredContent = (content: ContentItem[], purchaseStatus: string | null) => {
    if (!purchaseStatus) return content;
    
    switch (purchaseStatus) {
      case 'free':
        return content.filter(item => item.is_public);
      case 'unpurchased': // "Shop" content
        return content.filter(item => !item.is_public);
      default:
        return content;
    }
  };

  // Calculate purchase status counts for client-side filtering
  const getPurchaseStatusCounts = () => {
    if (!contentData) return undefined;
    
    if (contentData.isPrivateResponse) {
      // For private API responses, use server data or calculate from content
      return {
        purchased: contentData.content.filter(c => c.is_purchased).length,
        free: contentData.content.filter(c => c.price === 0 || c.is_public).length,
        unpurchased: contentData.content.filter(c => !c.is_purchased && c.price > 0).length,
      };
    } else {
      // For public API responses, calculate based on is_public
      return {
        purchased: 0, // Not applicable for unauthenticated users
        free: contentData.content.filter(c => c.is_public).length,
        unpurchased: contentData.content.filter(c => !c.is_public).length,
      };
    }
  };

  // Apply client-side filtering for unauthenticated users
  const getDisplayContent = () => {
    if (!contentData) return [];
    
    // For authenticated users with private API, content is already filtered server-side
    if (contentData.isPrivateResponse) {
      return contentData.content;
    }
    
    // For unauthenticated users, apply client-side filtering
    return getFilteredContent(contentData.content, selectedPurchaseStatus);
  };

  // Handle purchase modal opening
  const handlePurchaseModalOpen = (content: ContentItem, account: ContentAccount) => {
    console.log('📋 ContentPage: Opening modal for:', content.title, 'Account:', account.display_name);
    openModal(content, account);
  };

  if (loading && !contentData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: contentData?.account?.background_image_url
            ? `url(${contentData.account.background_image_url})`
            : contentData?.account?.background_text_color || '#000000',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <ProfileNavbar
          backgroundColor={contentData?.account?.background_text_color}
          backgroundImageUrl={contentData?.account?.background_image_url}
          displayLink={displayLink || ''}
          displayName=""
          bio=""
          accountType="creator"
        />
        
        <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="circular" width={120} height={120} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} variant="rounded" width={100} height={32} />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Box key={i}>
                <Skeleton variant="rounded" width="100%" height={200} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!contentData) return null;

  // Use your profile image collection for fallbacks
  const profileImageUrl = contentData.account?.profile_image_url || 
    getProfileImageFallback(contentData.account?.display_link || '');

  // Use fallback background if no background image
  const backgroundStyle = contentData.account?.background_image_url
    ? {
        backgroundImage: `url(${contentData.account.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {
        background: getProfileBackgroundFallback(contentData.account?.display_link || ''),
      };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          ...backgroundStyle,
        }}
      >
        <ProfileNavbar
          backgroundColor={contentData.account?.background_text_color}
          backgroundImageUrl={contentData.account?.background_image_url}
          textColor={textColor}
          displayLink={contentData.account?.display_link || ''}
          displayName={contentData.account?.display_name || ''}
          bio=""
          profileImageSignedUrl={profileImageUrl}
          accountType="creator"
        />

        <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
          {/* Profile Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(156.52deg, ${uiBackgroundColor} 2.12%, rgba(255, 255, 255, 0.05) 54.33%, ${uiBackgroundColor} 93.02%)`,
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${uiBorderColor}`,
            }}
          >
            <Avatar
              src={profileImageUrl}
              sx={{
                width: 120,
                height: 120,
                border: `3px solid ${textColor}30`,
              }}
            >
              {contentData.account?.display_name?.charAt(0)}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  color: textColor,
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                {contentData.account?.display_name}
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: subtleTextColor,
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                @{contentData.account?.display_link}
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: subtleTextColor,
                  mb: 2,
                }}
              >
                {contentData.pagination.total_content} content items
              </Typography>

              {!authState.isAuthenticated && (
                <Button
                  variant="contained"
                  onClick={() => navigate({ to: '/user-sign-in' })}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Sign in to purchase content
                </Button>
              )}
            </Box>
          </Box>

          {/* Content Filters - Now shows for both authenticated and unauthenticated */}
          <ContentFilters
            selectedFilter={selectedFilter}
            selectedPurchaseStatus={selectedPurchaseStatus}
            onFilterChange={setSelectedFilter}
            onPurchaseStatusChange={setSelectedPurchaseStatus}
            contentCounts={getContentCounts()}
            purchaseStatusCounts={getPurchaseStatusCounts()}
            textColor={textColor}
            uiBackgroundColor={uiBackgroundColor}
            uiBorderColor={uiBorderColor}
            isAuthenticated={authState.isAuthenticated}
          />

          {/* Content Grid with filtered content */}
          <ContentGrid
            content={getDisplayContent()}
            account={contentData?.account || ({} as ContentAccount)}
            loading={loadingMore}
            hasMore={contentData?.pagination.has_more || false}
            onLoadMore={handleLoadMore}
            onPlay={handlePlay}
            onPurchaseClick={handlePurchaseModalOpen}
            textColor={textColor}
            uiBackgroundColor={uiBackgroundColor}
            uiBorderColor={uiBorderColor}
          />
        </Container>
      </Box>

      {/* Purchase Modal - Add debugging here too */}
      {console.log('🎭 About to render PurchaseModal:', { isOpen, selectedContent: !!selectedContent, selectedAccount: !!selectedAccount })}
      {selectedContent && selectedAccount && (
        <PurchaseModal
          content={selectedContent}
          account={selectedAccount}
          open={isOpen}
          onClose={closeModal}
          onPurchase={handlePurchase}
          onSignIn={handleSignIn}
        />
      )}
    </>
  );
}