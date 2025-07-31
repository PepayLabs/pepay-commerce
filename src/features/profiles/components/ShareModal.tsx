import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Box, 
  Typography, 
  IconButton, 
  Button,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import XIcon from '@mui/icons-material/X';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  displayLink: string;
  displayName: string;
  bio: string;
  profileImageSignedUrl?: string;
  accountType: string;
}

export default function ShareModal({
  open,
  onClose,
  displayLink,
  displayName,
  bio,
  profileImageSignedUrl,
  accountType
}: ShareModalProps) {
  const theme = useTheme();
  
  const profileUrl = `https://grabmeaslice.com/i/${displayLink}`;
  
  // Generate share text based on account type
  const getShareText = () => {
    if (accountType === 'npo') {
      return `Check out ${displayName}'s fundraiser: ${bio}`;
    } else {
      return `Support ${displayName}: ${bio}`;
    }
  };

  const shareText = getShareText();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(profileUrl);
    const encodedText = encodeURIComponent(shareText);
    const encodedDisplayName = encodeURIComponent(displayName);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'x':
        // X will automatically fetch and display images from the URL if the page has proper meta tags
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        // Facebook will fetch the image from the page's Open Graph meta tags
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        // WhatsApp will preview the link and show the image from meta tags
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'linkedin':
        // LinkedIn will fetch the image from the page's meta tags
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'telegram':
        // Telegram will preview the link and show the image
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const socialPlatforms = [
    { 
      name: 'X', 
      icon: <XIcon />, 
      color: '#000000', 
      onClick: () => handleSocialShare('x') 
    },
    { 
      name: 'Telegram', 
      icon: <TelegramIcon />, 
      color: '#0088cc', 
      onClick: () => handleSocialShare('telegram') 
    },
    { 
      name: 'WhatsApp', 
      icon: <WhatsAppIcon />, 
      color: '#25D366', 
      onClick: () => handleSocialShare('whatsapp') 
    },
    { 
      name: 'Facebook', 
      icon: <FacebookIcon />, 
      color: '#1877F2', 
      onClick: () => handleSocialShare('facebook') 
    },
    { 
      name: 'LinkedIn', 
      icon: <LinkedInIcon />, 
      color: '#0A66C2', 
      onClick: () => handleSocialShare('linkedin') 
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: theme.shape.borderRadius,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
          color: '#333333'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        color: '#333333',
        fontWeight: 600
      }}>
        Unique Profile Link
        <IconButton onClick={onClose} size="small" sx={{ color: '#666666' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {/* Profile Link Section */}
        <Box sx={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 2,
          p: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#333333',
              wordBreak: 'break-all',
              flex: 1,
              mr: 2
            }}
          >
            {profileUrl}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyLink}
            sx={{
              borderColor: '#ccc',
              color: '#333333',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }
            }}
          >
            Copy
          </Button>
        </Box>

        <Divider sx={{ my: 2, borderColor: 'rgba(0, 0, 0, 0.1)' }} />

        {/* Share Message Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#333333' }}>
            {accountType === 'npo' 
              ? 'Reach more Donors by sharing' 
              : 'Support your creator by sharing'
            }
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
            {accountType === 'npo' 
              ? "We've written tailored messages and auto-generated posters based on the fundraiser for you to share"
              : "Your creator has written a tailored message and auto-generate posters based on the creator's story for you to share"
            }
          </Typography>
        </Box>

        {/* Social Media Buttons */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 2,
          mt: 2
        }}>
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.name}
              variant="outlined"
              startIcon={platform.icon}
              onClick={platform.onClick}
              sx={{
                borderColor: platform.color,
                color: platform.color,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: `${platform.color}10`,
                  borderColor: platform.color,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 8px ${platform.color}20`
                },
                transition: 'all 0.2s ease'
              }}
            >
              {platform.name}
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
