import React from 'react'
import { Card, CardContent, Typography, Button, Box, LinearProgress, Chip } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { PersonAdd, Visibility, CheckCircle } from '@mui/icons-material'

interface ProfileSetupCardProps {
  profileData?: any // This will come from your profile API
  hasPublishedProfile: boolean
}

export function ProfileSetupCard({ profileData, hasPublishedProfile }: ProfileSetupCardProps) {
  const navigate = useNavigate()

  // Calculate completion percentage based on filled fields
  const calculateCompletionPercentage = () => {
    if (!profileData) return 0
    
    const requiredFields = [
      'display_name',
      'bio',
      'short_bio',
    ]
    
    const optionalSections = [
      // Social Links (worth 15%)
      ['instagram_url', 'twitter_url', 'tiktok_url', 'youtube_url', 'website_url'],
      // Support Settings (worth 15%)
      ['support_title', 'support_message', 'custom_donation_amount_1'],
      // Media Gallery (worth 10%)
      ['media'],
      // Custom Links (worth 10%)
      ['links'],
      // Page Design (worth 20%)
      ['background_color', 'banner_title', 'profile_image_signed_url'],
      // Fundraising Goals (worth 10%)
      ['goal']
    ]
    
    // Required fields are worth 20% total
    const requiredCompletion = requiredFields.filter(field => 
      profileData[field] && profileData[field].length > 0
    ).length / requiredFields.length * 20
    
    // Each optional section is worth different percentages
    const sectionWeights = [15, 15, 10, 10, 20, 10]
    const optionalCompletion = optionalSections.reduce((total, section, index) => {
      const sectionCompletion = section.some(field => {
        if (field === 'media' || field === 'links') {
          return profileData[field] && profileData[field].length > 0
        }
        if (field === 'goal') {
          return profileData[field] && profileData[field].title
        }
        return profileData[field] && profileData[field].length > 0
      }) ? sectionWeights[index] : 0
      
      return total + sectionCompletion
    }, 0)
    
    return Math.min(100, requiredCompletion + optionalCompletion)
  }

  const profileCompletionPercentage = calculateCompletionPercentage()

  const handleContinueSetup = () => {
    navigate({ to: '/dashboard/profile/wizard' })
  }

  const handleViewProfile = () => {
    navigate({ to: `/i/${profileData?.display_link}` })
  }

  if (hasPublishedProfile && profileCompletionPercentage >= 80) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'success.main', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle /> Profile Published
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your profile is live and visible to the public
              </Typography>
              <Chip 
                label={`${profileCompletionPercentage}% Complete`} 
                color="success" 
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Visibility />}
                onClick={handleViewProfile}
                size="small"
              >
                View Profile
              </Button>
              <Button
                variant="outlined"
                onClick={handleContinueSetup}
                size="small"
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Complete Your Profile
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Profile Completion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profileCompletionPercentage}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={profileCompletionPercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                backgroundColor: profileCompletionPercentage > 50 ? 'success.main' : 'warning.main'
              }
            }}
          />
        </Box>

        {/* Completion Status */}
        <Box sx={{ mb: 3 }}>
          {profileCompletionPercentage < 20 && (
            <Chip label="Getting Started" color="default" size="small" />
          )}
          {profileCompletionPercentage >= 20 && profileCompletionPercentage < 50 && (
            <Chip label="Basic Setup Complete" color="primary" size="small" />
          )}
          {profileCompletionPercentage >= 50 && profileCompletionPercentage < 80 && (
            <Chip label="Almost Ready" color="warning" size="small" />
          )}
          {profileCompletionPercentage >= 80 && (
            <Chip label="Ready to Publish" color="success" size="small" />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {profileCompletionPercentage < 20 
            ? "Let's start with the basics - your name, bio, and profile picture"
            : profileCompletionPercentage < 50
            ? "Great start! Add social links and customize your support settings"
            : profileCompletionPercentage < 80
            ? "You're almost there! Add media and customize your page design"
            : "Your profile is ready! Publish it to start receiving support from your audience."
          }
        </Typography>

        <Button
          variant="contained"
          fullWidth
          startIcon={profileCompletionPercentage >= 80 ? <Visibility /> : <PersonAdd />}
          onClick={handleContinueSetup}
        >
          {profileCompletionPercentage >= 80 ? 'Review & Publish' : 'Continue Setup'}
        </Button>
      </CardContent>
    </Card>
  )
}
