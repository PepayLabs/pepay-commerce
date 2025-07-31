import { Box, Typography, Button, Tooltip, IconButton, Divider } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { 
  Home as HomeIcon,
  Settings as SettingsIcon,
  Description as DocumentIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material'

interface SocialMediaFooterProps {
  showCreateAccount?: boolean
  createAccountText?: string
  createAccountLink?: string
}

export default function SocialMediaFooter({ 
  showCreateAccount = true,
  createAccountText = "Any Questions?",
  createAccountLink = "/faqs"
}: SocialMediaFooterProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }} />
      
      {showCreateAccount && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {createAccountText}
          </Typography>
          <Button
            variant="text"
            startIcon={<PersonAddIcon />}
            component={Link}
            to={createAccountLink}
            sx={{ color: 'primary.main' }}
          >
            Create Account Instead
          </Button>
        </Box>
      )}

      {/* Social media and navigation icons */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Social Media Icons - Left side */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Twitter">
            <IconButton 
              component="a" 
              href="https://twitter.com/peperuneypizza" 
              target="_blank"
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: '#1DA1F2' }
              }}
            >
              <TwitterIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Telegram">
            <IconButton 
              component="a" 
              href="https://t.me/pepay" 
              target="_blank"
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: '#0088cc' }
              }}
            >
              <TelegramIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Navigation Icons - Right side */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton 
              component={Link}
              to="/"
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' }
              }}
            >
              <HomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Terms of Service">
            <IconButton 
              component={Link}
              to="/terms"
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' }
              }}
            >
              <DocumentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Privacy Policy">
            <IconButton 
              component={Link}
              to="/privacy"
              size="small"
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}
