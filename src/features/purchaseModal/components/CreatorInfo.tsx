import { Box, Typography, Avatar, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LinkIcon from '@mui/icons-material/Link';
import { CreatorInfoProps } from '../types/purchase.types';

export default function CreatorInfo({
  account,
  onCreatorClick,
}: CreatorInfoProps) {
  // Use background_text_color or default to white since background is dark
  const actualTextColor = account.background_text_color || '#ffffff';
  const subtleTextColor = `${actualTextColor}CC`;

  return (
    <Box
      sx={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
        borderRadius: '36px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        p: 2,
        cursor: onCreatorClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onCreatorClick ? {
          transform: 'translateY(-2px)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)',
          '& .creator-link-icon': {
            opacity: 1,
            transform: 'scale(1)',
          }
        } : {},
      }}
      onClick={onCreatorClick}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
      }}>
        <Avatar
          src={account.profile_image_url}
          sx={{
            width: 48,
            height: 48,
            border: `2px solid ${actualTextColor}30`,
            fontSize: '1.2rem',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          {account.display_name?.charAt(0)}
        </Avatar>
        
        <Box sx={{ 
          flex: 1, 
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 0.5,
        }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: actualTextColor,
              fontSize: '1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.25,
              lineHeight: 1.3,
            }}
          >
            {account.display_name}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: subtleTextColor,
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            @{account.display_link}
          </Typography>
        </Box>

        {/* Link indicator */}
        {onCreatorClick && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            flexShrink: 0,
          }}>
            <LinkIcon 
              className="creator-link-icon"
              sx={{ 
                fontSize: 16, 
                color: actualTextColor,
                opacity: 0,
                transform: 'scale(0.8)',
                transition: 'all 0.2s ease',
              }} 
            />
            <IconButton
              size="small"
              sx={{
                color: actualTextColor,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}