import { 
  Box, 
  Typography, 
  Avatar, 
  Divider,
  Link,
  CircularProgress,
  Alert,
  Button,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContrastColors } from '../hooks/useContrastColors';
import { useDonations } from '../hooks/useDonations';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import InfoIcon from '@mui/icons-material/Info';
import { SvgIcon } from '@mui/material';

// TikTok icon component
const TikTokIcon = () => (
  <SvgIcon sx={{ fontSize: '16px' }}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.26z"/>
  </SvgIcon>
);

interface ProfileCommentsProps {
  displayLink: string;
  displayName: string;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
  accountType?: string | null;
}

// Helper functions
const getSocialIcon = (platform: string | null) => {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon sx={{ fontSize: '16px', mr: 0.5 }} />;
    case 'twitter':
      return <TwitterIcon sx={{ fontSize: '16px', mr: 0.5 }} />;
    case 'tiktok':
      return <TikTokIcon />;
    case 'telegram':
      return <TelegramIcon sx={{ fontSize: '16px', mr: 0.5 }} />;
    default:
      return null;
  }
};

const getSocialUrl = (platform: string | null, username: string) => {
  const cleanUsername = username.replace('@', '');
  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${cleanUsername}`;
    case 'twitter':
      return `https://twitter.com/${cleanUsername}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanUsername}`;
    case 'telegram':
      return `https://t.me/${cleanUsername}`;
    default:
      return null;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 21) return '2 weeks ago';
  if (diffDays < 28) return '3 weeks ago';
  if (diffDays < 60) return '1 month ago';
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Updated function to use local profile images
const getRandomAvatar = (index: number, isAnonymous: boolean = false): string => {
  // Array of your local profile images (adjust the numbers/names based on your actual files)
  const profileImages = [
    '/images/profiles/1.jpg',
    '/images/profiles/2.jpg', 
    '/images/profiles/3.jpg',
    '/images/profiles/4.png',
    '/images/profiles/5.png',
    '/images/profiles/6.png',
    '/images/profiles/7.png',
    '/images/profiles/8.png',
    '/images/profiles/9.png',
    '/images/profiles/10.png',
    '/images/profiles/11.jpg',
    '/images/profiles/12.png',
    '/images/profiles/13.jpg',
    '/images/profiles/14.png',
    '/images/profiles/15.png',
    '/images/profiles/16.png',
    '/images/profiles/17.jpeg',
    '/images/profiles/18.png',
    '/images/profiles/19.png',
    '/images/profiles/20.png',
    '/images/profiles/21.jpeg',
    '/images/profiles/22.png',
    '/images/profiles/23.png',
    '/images/profiles/24.jpg',
    '/images/profiles/25.jpg',
    '/images/profiles/26.jpeg',
    '/images/profiles/27.jpg',
    '/images/profiles/28.png',
    '/images/profiles/29.png',
    '/images/profiles/30.png',
    '/images/profiles/31.png',
    '/images/profiles/32.png'
  ];

  // Anonymous users get a special subset or different images
  const anonymousImages = [
    '/images/profiles/anonymous1.jpg',
    '/images/profiles/anonymous2.png',
    '/images/profiles/anonymous3.jpeg',
    '/images/profiles/1.jpg', // Fallback to regular profiles if no anonymous ones
    '/images/profiles/5.png',
    '/images/profiles/10.jpg',
    '/images/profiles/15.jpeg',
    '/images/profiles/20.png'
  ];

  if (isAnonymous) {
    return anonymousImages[index % anonymousImages.length];
  }
  
  return profileImages[index % profileImages.length];
};

export default function ProfileComments({ 
  displayLink,
  displayName,
  backgroundColor = null,
  backgroundImageUrl = null,
  textColor = null,
  accountType = null
}: ProfileCommentsProps) {
  const theme = useTheme();
  const { donations, loading, loadingMore, error, pagination, loadMoreDonations } = useDonations(displayLink);
  
  // Get colors based on the background
  const { 
    subtleTextColor, 
    uiBorderColor,
    uiBackgroundColor 
  } = useContrastColors(backgroundColor, backgroundImageUrl);

  if (loading) {
    return (
      <Box sx={{ 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        backgroundColor: uiBackgroundColor,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${uiBorderColor}`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200
      }}>
        <CircularProgress size={40} sx={{ color: textColor }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        backgroundColor: uiBackgroundColor,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${uiBorderColor}`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        p: 2
      }}>
        <Alert severity="error" sx={{ backgroundColor: 'transparent' }}>
          Failed to load donations: {error}
        </Alert>
      </Box>
    );
  }

  if (!donations || donations.length === 0) {
    // Dynamic empty state message based on account type
    const emptyStateMessage = accountType === 'npo' 
      ? `Support the cause 💚 to leave a message`
      : `Grab ${displayName} a slice 🍕 to leave a message`;

    return (
      <Box sx={{ 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        backgroundColor: uiBackgroundColor,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${uiBorderColor}`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 120,
        textAlign: 'center'
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            color: textColor || 'white',
            fontWeight: 500,
            mb: 0.5
          }}
        >
          {emptyStateMessage}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'rgba(128, 128, 128, 0.6)'
          }}
        >
          ❤️
        </Typography>
      </Box>
    );
  }
  
  // Dynamic title and tooltip based on account type
  const sectionTitle = accountType === 'npo' ? 'Recent Donations' : 'Recent Supporters';
  const tooltipText = accountType === 'npo' 
    ? 'Donate to the cause to leave a message & socials to contact you'
    : 'Support this creator to leave a message & socials to contact you';
  
  return (
    <Box sx={{ 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      backgroundColor: uiBackgroundColor,
      borderRadius: '36px',
      border: `1px solid ${uiBorderColor}`,
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 2
    }}>
      {/* Header with Info Icon */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1.5
      }}>
        <Typography variant="h6" fontWeight={700} color={textColor || 'black'}>
          {sectionTitle}
        </Typography>
        <Tooltip 
          title={tooltipText}
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
      
      {/* Comments list */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 0.2
      }}>
        {donations.map((donation, index) => {
          const isAnonymous = !donation.donation_name || donation.donation_name.trim() === '' || donation.donation_name === 'Anonymous';
          const displayName = isAnonymous ? 'Anonymous' : donation.donation_name;
          const socialUrl = donation.social_platform ? getSocialUrl(donation.social_platform, displayName) : null;
          const socialIcon = getSocialIcon(donation.social_platform);
          
          return (
            <Box 
              key={donation.donation_id}
              sx={{ 
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Support Header */}
              <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: donation.message ? 1 : 0 }}>
                  <Avatar 
                    src={getRandomAvatar(index, isAnonymous)} 
                    alt={displayName} 
                    sx={{ 
                      width: 42, 
                      height: 42, 
                      mr: 1.5,
                      border: '2px solid rgba(255, 255, 255, 0.2)'
                    }} 
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      color={textColor}
                      sx={{ fontWeight: 500, lineHeight: 1.0 }}
                    >
                      {/* Fixed spacing with proper inline layout */}
                      {socialIcon && (
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mr: 0.5 }}>
                          {socialIcon}
                        </Box>
                      )}
                      {socialUrl ? (
                        <Link 
                          href={socialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ 
                            fontWeight: 600, 
                            color: textColor, 
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {displayName}
                        </Link>
                      ) : (
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {displayName}
                        </Box>
                      )}
                      <Box component="span">
                        {' '}supported with{' '}
                      </Box>
                      <Box component="span" sx={{ 
                        fontWeight: 700, 
                        color: textColor || theme.palette.primary.main 
                      }}>
                        ${parseFloat(donation.amount_usd).toFixed(0)}
                      </Box>
                    </Typography>
                    <Typography variant="caption" color={textColor || subtleTextColor} sx={{ fontSize: '10px' }}>
                      {formatDate(donation.paid_at)}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Donor Message */}
                {donation.message && (
                  <Box sx={{ 
                    mt: 1,
                    p: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${theme.palette.primary.main}`
                  }}>
                    <Typography 
                      variant="body2" 
                      color={textColor || subtleTextColor}
                      sx={{ fontStyle: 'italic', lineHeight: 1.3, fontSize: '13px' }}
                    >
                      "{donation.message}"
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Creator Response */}
              {donation.response_message && (
                <>
                  <Divider sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }} />
                  <Box sx={{ 
                    p: 1.5,
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.3 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 600,
                          background: `linear-gradient(45deg, ${textColor || theme.palette.primary.main}, #ffd700, ${textColor || theme.palette.primary.main})`,
                          backgroundSize: '200% 200%',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          animation: 'shimmer 2s ease-in-out infinite',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontSize: '9px',
                          '@keyframes shimmer': {
                            '0%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' },
                            '100%': { backgroundPosition: '0% 50%' }
                          }
                        }}
                      >
                        Creator Response ❤️
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color={textColor}
                      sx={{ lineHeight: 1.3, fontSize: '13px' }}
                    >
                      {donation.response_message}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Load More Button - Only new addition */}
      {pagination?.has_next_page && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            onClick={loadMoreDonations}
            disabled={loadingMore}
            sx={{
              color: textColor,
              borderColor: uiBorderColor,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }}
            variant="outlined"
          >
            {loadingMore ? (
              <CircularProgress size={20} sx={{ color: textColor }} />
            ) : (
              `Load More (${pagination.total_count - donations.length})`
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
}