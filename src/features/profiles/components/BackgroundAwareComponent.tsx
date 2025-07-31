import React from 'react';
import { useContrastColors } from '../hooks/useContrastColors';
import { Box } from '@mui/material';

// Higher-order component that adapts to background
export default function BackgroundAwareComponent({ 
  children, 
  backgroundColor, 
  fallbackIsDark = true,
  ...props 
}) {
  const { textColor, subtleTextColor, uiElementColor, uiBorderColor } = 
    useContrastColors(backgroundColor, fallbackIsDark);
    
  return (
    <Box
      sx={{
        color: textColor,
        '& .background-aware-subtle-text': {
          color: subtleTextColor,
        },
        '& .background-aware-ui-element': {
          backgroundColor: uiElementColor,
          borderColor: uiBorderColor,
        }
      }}
      {...props}
    >
      {children}
    </Box>
  );
}