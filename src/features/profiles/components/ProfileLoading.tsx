import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

// Slow rotation animation
const slowRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export default function ProfileLoading() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Large rotating logo */}
      <Box
        component="img"
        src="/images/logo.png" // Adjust path to your logo
        alt="Grab Me a Slice"
        sx={{
          width: { xs: 120, sm: 150, md: 180 },
          height: { xs: 120, sm: 150, md: 180 },
          animation: `${slowRotate} 3s linear infinite`,
          marginBottom: 3,
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))',
        }}
      />
      
      {/* Loading text */}
      <Typography
        variant="h6"
        sx={{
          color: '#666666',
          fontWeight: 500,
          letterSpacing: '0.5px',
          textAlign: 'center',
        }}
      >
        Loading Profile...
      </Typography>
      
      {/* Subtle loading dots */}
      <Box sx={{ marginTop: 2, display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#da532c',
              animation: `${slowRotate} 1.5s ease-in-out ${index * 0.2}s infinite alternate`,
              opacity: 0.7,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}