import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ProfileBannerProps {
  title?: string;
  color?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
}

export default function ProfileBanner({ 
  title, 
  color, 
  buttonText, 
  buttonLink,
  imageUrl 
}: ProfileBannerProps) {
  const theme = useTheme();
  
  // Don't render if no meaningful content exists
  if (!title && !imageUrl && !color) return null;
  
  return (
    <Box sx={{ 
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      borderRadius: '46px',
      border: '.1 px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: { xs: 6, md: 9},
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    
      backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dark overlay for text readability (only if there's an image) */}
      {imageUrl && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }} />
      )}
      
      {/* Only render title if it exists */}
      {title && (
        <Typography 
          variant="h5" 
          fontWeight={700} 
          color={imageUrl ? "white" : "inherit"}
          sx={{ zIndex: 2 }}
        >
          {title}
        </Typography>
      )}
      
      {/* Only render button if BOTH text and link exist */}
      {buttonText && buttonLink && (
        <Button 
          variant="contained"
          href={buttonLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            zIndex: 2,
            backgroundColor: 'white',
            color: 'black',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }
          }}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
}