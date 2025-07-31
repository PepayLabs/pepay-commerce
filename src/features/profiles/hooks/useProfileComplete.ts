import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function useProfileComplete() {
  const [isProfileCompleteState, setIsProfileCompleteState] = useState(false)
  const [showProfileWizard, setShowProfileWizard] = useState(false)

  // Same logic as Dashboard's isProfileComplete function
  const isProfileComplete = (data: any) => {
    if (!data || !data.account) return false;

    const required = [
      data.account.display_name && data.account.display_name !== 'string',
      data.account.bio,
      data.account.profile_image_signed_url,
    ]
    
    // Count social links
    const socialLinks = [
      data.account.website_url,
      data.account.instagram_url,
      data.account.twitter_url,
      data.account.tiktok_url,
      data.account.farcaster_url,
      data.account.youtube_url,
      data.account.blog_url,
      data.account.stream_url,
      data.account.telegram_url,
      data.account.discord_url,
    ].filter(link => link && link.trim()).length
    
    const optional = [
      data.links && data.links.length > 0,
      data.media && data.media.length > 0,
      data.goal !== null,
    ]
    
    // Debug logging
    console.log('🔍 Profile Completeness Check:', {
      required: required,
      requiredComplete: required.every(Boolean),
      socialLinks: socialLinks,
      socialLinksComplete: socialLinks >= 3,
      optional: optional,
      optionalComplete: optional.some(Boolean),
      account: {
        display_name: data.account.display_name,
        bio: data.account.bio ? 'has bio' : 'no bio',
        profile_image: data.account.profile_image_signed_url ? 'has image' : 'no image',
      }
    })
    
    // All required + at least 3 social links + at least 1 other optional
    const isComplete = required.every(Boolean) && socialLinks >= 3 && optional.some(Boolean)
    console.log('🎯 Final profile complete result:', isComplete)
    
    return isComplete
  }

  const checkProfileCompleteness = (profileData: any) => {
    const complete = isProfileComplete(profileData)
    setIsProfileCompleteState(complete)
    
    // Show wizard if profile is incomplete
    if (!complete) {
      setShowProfileWizard(true)
    }
    
    return complete
  }

  const handleProfileWizardComplete = () => {
    setShowProfileWizard(false)
    setIsProfileCompleteState(true)
    toast.success('Profile setup completed!')
  }

  return {
    isProfileCompleteState,
    showProfileWizard,
    setShowProfileWizard,
    isProfileComplete,
    checkProfileCompleteness,
    handleProfileWizardComplete
  }
}