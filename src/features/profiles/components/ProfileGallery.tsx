import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ProfileMedia } from '../types/profile.types';

interface ProfileGalleryProps {
  media: ProfileMedia[];
}

export default function ProfileGallery({ media }: ProfileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();

  if (!media || media.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <Box sx={{ 
      position: 'relative',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: theme.shape.borderRadius,
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      overflow: 'hidden',
      aspectRatio: '1 / 1',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {media.length > 1 && (
        <>
          <IconButton 
            onClick={handlePrev}
            sx={{ 
              position: 'absolute', 
              left: 8, 
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              }
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton 
            onClick={handleNext}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
              }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
      <Box 
        component="img"
        src={media[currentIndex].signed_url}
        alt={media[currentIndex].description || `Gallery image ${currentIndex + 1}`}
        sx={{ 
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'all 0.3s ease-in-out'
        }}
      />
      
      {/* Indicator dots for multiple images */}
      {media.length > 1 && (
        <Box sx={{ 
          position: 'absolute',
          bottom: 16,
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          width: '100%'
        }}>
          {media.map((_, index) => (
            <Box 
              key={index}
              sx={{ 
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentIndex 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.4)',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}