import React, { useState, useRef } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material'
import {
  PhotoCamera,
  Person,
  CloudUpload,
  Delete,
  Language as WebsiteIcon,
  Instagram,
  Twitter,
  YouTube,
  Telegram,
  Link as LinkIcon,
} from '@mui/icons-material'
import { useWizard } from '../../context/WizardProvider'

// Custom icon components for platforms not in MUI
const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04 0z"/>
  </svg>
)

const FarcasterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.5 5.5h-19v13h19v-13zm-17 11v-9h15v9h-15z"/>
    <path d="M6.5 8.5h2v7h-2zm9 0h2v7h-2z"/>
    <path d="M9.5 11.5h5v2h-5z"/>
  </svg>
)

const TwitchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
)

const BlogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
  </svg>
)

interface SocialPlatform {
  key: keyof typeof import('../../types/wizard.types').WizardAccountData
  label: string
  placeholder: string
  icon: React.ReactNode
  color: string
  domain?: string
}

const socialPlatforms: SocialPlatform[] = [
  {
    key: 'website_url',
    label: 'Website',
    placeholder: 'https://yourwebsite.com',
    icon: <WebsiteIcon />,
    color: '#1976d2'
  },
  {
    key: 'instagram_url',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    icon: <Instagram />,
    color: '#E4405F',
    domain: 'instagram.com'
  },
  {
    key: 'twitter_url',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/username',
    icon: <Twitter />,
    color: '#000000',
    domain: 'x.com'
  },
  {
    key: 'tiktok_url',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@username',
    icon: <TikTokIcon />,
    color: '#000000',
    domain: 'tiktok.com/@'
  },
  {
    key: 'farcaster_url',
    label: 'Warpcast',
    placeholder: 'https://warpcast.com/username',
    icon: <FarcasterIcon />,
    color: '#8A63D2',
    domain: 'warpcast.com'
  },
  {
    key: 'youtube_url',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@username',
    icon: <YouTube />,
    color: '#FF0000',
    domain: 'youtube.com/@'
  },
  {
    key: 'blog_url',
    label: 'Blog',
    placeholder: 'https://yourblog.com',
    icon: <BlogIcon />,
    color: '#FF6B35'
  },
  {
    key: 'stream_url',
    label: 'Twitch',
    placeholder: 'https://twitch.tv/username',
    icon: <TwitchIcon />,
    color: '#9146FF'
  },
  {
    key: 'telegram_url',
    label: 'Telegram',
    placeholder: 'https://t.me/username',
    icon: <Telegram />,
    color: '#0088CC',
    domain: 't.me'
  },
  {
    key: 'discord_url',
    label: 'Discord',
    placeholder: 'https://discord.gg/invite',
    icon: <DiscordIcon />,
    color: '#5865F2'
  }
]

export default function SocialLinksStep() {
  const { state, actions } = useWizard()
  const { account } = state.formData
  const { errors } = state

  // Update the validation function to handle both usernames and full URLs
  const validateUrl = (url: string, platform?: SocialPlatform): string | null => {
    // Allow empty strings (no validation needed)
    if (!url || !url.trim()) return null
    
    const trimmedValue = url.trim()
    
    // If it's a full URL, validate it
    if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
      try {
        new URL(trimmedValue)
        return null
      } catch {
        return 'Please enter a valid URL'
      }
    }
    
    // If it's just a username, validate the format based on platform
    if (platform) {
      switch (platform.key) {
        case 'farcaster_url':
        case 'instagram_url':
        case 'twitter_url':
        case 'telegram_url':
        case 'stream_url':
          // Allow alphanumeric usernames, underscores, dots, hyphens
          if (!/^[a-zA-Z0-9._-]+$/.test(trimmedValue)) {
            return `Please enter a valid ${platform.label} username or full URL`
          }
          break
        case 'tiktok_url':
          // Allow usernames with or without @
          const cleanUsername = trimmedValue.startsWith('@') ? trimmedValue.slice(1) : trimmedValue
          if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
            return 'Please enter a valid TikTok username (with or without @) or full URL'
          }
          break
        case 'youtube_url':
          // Allow usernames with or without @
          const cleanYtUsername = trimmedValue.startsWith('@') ? trimmedValue.slice(1) : trimmedValue
          if (!/^[a-zA-Z0-9._-]+$/.test(cleanYtUsername)) {
            return 'Please enter a valid YouTube username (with or without @) or full URL'
          }
          break
        case 'discord_url':
          // Allow discord invite codes or full URLs
          if (!/^[a-zA-Z0-9]+$/.test(trimmedValue) && !trimmedValue.includes('discord.gg/')) {
            return 'Please enter a Discord invite code or full URL'
          }
          break
        case 'website_url':
        case 'blog_url':
          // For website and blog, require full URLs or valid domains
          if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmedValue)) {
            return 'Please enter a valid website URL or domain'
          }
          break
      }
    }
    
    return null
  }

  const handleInputChange = (field: keyof typeof account) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    actions.updateAccountData({ [field]: value })
    
    // Only validate if there's actually a value
    if (value && value.trim()) {
      const platform = socialPlatforms.find(p => p.key === field)
      const error = validateUrl(value, platform)
      if (error) {
        actions.setErrors?.({ [field]: error })
      } else {
        // Clear error for this field
        const newErrors = { ...errors }
        delete newErrors[field]
        actions.setErrors?.(newErrors)
      }
    } else {
      // Clear error for empty fields
      const newErrors = { ...errors }
      delete newErrors[field]
      actions.setErrors?.(newErrors)
    }
  }

  const clearField = (field: keyof typeof account) => {
    // Update the account data to empty string
    actions.updateAccountData({ [field]: '' })
    
    // Clear any errors for this field
    const newErrors = { ...errors }
    delete newErrors[field]
    actions.setErrors?.(newErrors)
    
    // Force a save to ensure the empty value persists
    setTimeout(() => {
      actions.saveProgress?.()
    }, 100)
  }

  // Count connected social links
  const connectedLinks = socialPlatforms.filter(platform => {
    const value = (account[platform.key] as string) || ''
    return value.trim().length > 0
  }).length

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          Connect Your Social Media
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Link your social accounts so supporters can find and follow you across platforms.
          <strong> Add at least 3 links to complete your profile.</strong>
        </Typography>
        
        {/* Progress indicator */}
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 1, 
          px: 2, 
          py: 1, 
          borderRadius: 2,
          bgcolor: connectedLinks >= 3 ? 'success.light' : 'warning.light',
          color: connectedLinks >= 3 ? 'success.dark' : 'warning.dark'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {connectedLinks} of 10 platforms connected
          </Typography>
        </Box>
      </Box>

      {/* Success Alert */}
      {connectedLinks >= 3 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Great!</strong> You've added enough social links to complete your profile. 
            Feel free to add more platforms below.
          </Typography>
        </Alert>
      )}

      {/* Social Platform Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {socialPlatforms.map((platform, index) => {
          const value = (account[platform.key] as string) || ''
          const hasValue = value.trim().length > 0

          return (
            <Box key={platform.key}>
              <Paper
                sx={{
                  p: 3,
                  border: hasValue ? `2px solid ${platform.color}` : '1px solid',
                  borderColor: hasValue ? platform.color : 'grey.300',
                  bgcolor: hasValue ? `${platform.color}08` : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: platform.color,
                    bgcolor: `${platform.color}08`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: platform.color,
                      color: 'white',
                    }}
                  >
                    {platform.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {platform.label}
                  </Typography>
                  {hasValue && (
                    <IconButton
                      size="small"
                      onClick={() => clearField(platform.key)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.light', color: 'white' },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  placeholder={platform.placeholder}
                  value={value}
                  onChange={handleInputChange(platform.key)}
                  error={!!errors[platform.key]}
                  helperText={errors[platform.key]}
                  InputProps={{
                    startAdornment: platform.domain && (
                      <InputAdornment position="start">
                        <Typography variant="body2" color="text.secondary">
                          {platform.domain}/
                        </Typography>
                      </InputAdornment>
                    ),
                    endAdornment: hasValue && (
                      <InputAdornment position="end">
                        <LinkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: platform.color,
                      },
                    },
                  }}
                />
              </Paper>
              
              {index === 2 && (
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Optional Links
                  </Typography>
                </Divider>
              )}
            </Box>
          )
        })}
      </Box>

      {/* Helpful Tips */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Pro tip:</strong> Make sure your username or URLs are complete (include https://) 
          and public. These links will appear on your profile for supporters to find you 
          across all platforms.
        </Typography>
      </Alert>
    </Box>
  )
}
