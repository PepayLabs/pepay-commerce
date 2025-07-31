import React from 'react';
import { Box } from '@mui/material';

interface PlatformBrandingProps {
  textColor?: string;
}

export default function PlatformBranding({ textColor }: PlatformBrandingProps) {
  // Use white for text since background is dark
  const actualTextColor = '#ffffff';

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {/* App Logo */}
      <Box sx={{ 
        width: 48, 
        height: 48, 
        borderRadius: 2,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <img 
          src="/images/gmas-app-square.png" 
          alt="Grab Me a Slice Logo" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </Box>

      {/* Text Logo - Don't apply filter, use original colors */}
      <Box 
        sx={{ 
          height: 38,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img 
          src="/images/gmas-written.png" 
          alt="Grab Me a Slice"
          style={{ 
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            // Remove the filter to use original logo colors
          }} 
        />
      </Box>
    </Box>
  );
}