import { Box, Typography, Link } from '@mui/material';

interface ProfileFooterProps {
  textColor?: string | null;
}

export default function ProfileFooter({ textColor = null }: ProfileFooterProps) {
  return (
    <Box sx={{ 
      mt: 6,
      mb: 4,
    }}>
      {/* Main footer section */}
      <Box sx={{ 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        p: { xs: 2.5, md: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 2, md: 3 },
      }}>
        
        {/* Built by section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              fontSize: '14px',
              background: 'linear-gradient(45deg, #22c55e, #ef4444, #ffd700, #22c55e)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 2s ease-in-out infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              }
            }}
          >
            Built by the team at
          </Typography>
          <Box sx={{ 
            height: 36,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Link 
              href="https://pepay.io" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                '&:hover': {
                  opacity: 0.8,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <img 
                src="/images/PEPAY-logo-written-prod.png"
                alt="Pepay"
                style={{ 
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </Link>
          </Box>
        </Box>

        {/* Supported by section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: textColor || 'rgb(243, 241, 241)',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            Supported by
          </Typography>
          <Box sx={{ 
            height: 12,
            display: 'flex',
            alignItems: 'center'
          }}>
            <img 
              src="/images/bnb-chain.png"
              alt="BNB"
              style={{ 
                height: '150%',
                width: '150',
                objectFit: 'contain'
              }} 
            />
          </Box>
        </Box>
      </Box>

      {/* Terms strip */}
      <Box sx={{ 
        mt: 1,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        py: 1.5,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        <Link 
          href="/terms" 
          underline="none"
          sx={{ 
            color: textColor || 'rgba(0, 0, 0, 0.6)',
            fontSize: '12px',
            fontWeight: 500,
            '&:hover': {
              color: textColor || 'rgba(0, 0, 0, 0.8)'
            }
          }}
        >
          Terms of Service
        </Link>
        <Typography sx={{ color: textColor || 'rgba(0, 0, 0, 0.4)', fontSize: '12px' }}>•</Typography>
        <Link 
          href="/privacy" 
          underline="none"
          sx={{ 
            color: textColor || 'rgba(0, 0, 0, 0.6)',
            fontSize: '12px',
            fontWeight: 500,
            '&:hover': {
              color: textColor || 'rgba(0, 0, 0, 0.8)'
            }
          }}
        >
          Privacy Policy
        </Link>
        <Typography sx={{ color: textColor || 'rgba(0, 0, 0, 0.4)', fontSize: '12px' }}>•</Typography>
        <Link 
          href="mailto:Contact@peperuney.pizza" 
          underline="none"
          sx={{ 
            color: textColor || 'rgba(0, 0, 0, 0.6)',
            fontSize: '12px',
            fontWeight: 500,
            '&:hover': {
              color: textColor || 'rgba(0, 0, 0, 0.8)'
            }
          }}
        >
          Contact
        </Link>
      </Box>
    </Box>
  );
}