import React from 'react'
import { Box, Typography, Container } from '@mui/material'
import { useWizard } from '../context/WizardProvider'

// Import your existing profile components
import ProfileHeader from '@/features/profiles/components/ProfileHeader'
import ProfileSocial from '@/features/profiles/components/ProfileSocial'
import ProfileBanner from '@/features/profiles/components/ProfileBanner'
import ProfileLinks from '@/features/profiles/components/ProfileLinks'
import ProfileSupport from '@/features/profiles/components/ProfileSupport'
import ProfileGallery from '@/features/profiles/components/ProfileGallery'
import ProfileGoals from '@/features/profiles/components/ProfileGoals'

export function ProfilePreview() {
  const { state, steps } = useWizard()
  const { formData, currentStep } = state
  const { account, media, links, goal } = formData
  
  // Get current step to determine what to show
  const currentStepData = steps[currentStep]

  // Helper function to get payment amounts based on payment model
  const getPaymentAmounts = () => {
    if (!account) return { amount1: 5, amount2: 10, amount3: 25 };
    console.log('💰 Payment model:', account.payment_model)
    // Check payment model and use appropriate amounts
    if (account.payment_model === 'donations') {
      // Use new donation_amounts structure if available, fallback to legacy
      const amounts = account.donation_amounts || {
        amount_1: account.custom_donation_amount_1 || 5,
        amount_2: account.custom_donation_amount_2 || 10,
        amount_3: account.custom_donation_amount_3 || 25
      };
      
      return {
        amount1: Math.round(amounts.amount_1),
        amount2: Math.round(amounts.amount_2),
        amount3: Math.round(amounts.amount_3)
      };
    } else if (account.payment_model === 'subscriptions') {
      // For subscriptions, we need to pass subscription pricing
      const pricing = account.subscription_pricing || {
        monthly_price: 10,
        quarterly_price: 27,
        yearly_price: 80
      };
      
      // Note: ProfileSupport component will need to be updated to handle subscription pricing
      // For now, we'll pass the monthly price as amounts for compatibility
      return {
        amount1: Math.round(pricing.monthly_price),
        amount2: Math.round(pricing.quarterly_price),
        amount3: Math.round(pricing.yearly_price)
      };
    }

    // Fallback to defaults
    return { amount1: 5, amount2: 10, amount3: 25 };
  };

  const paymentAmounts = getPaymentAmounts();

  const renderStepPreview = () => {
    switch (currentStepData?.id) {
      case 'profile-basics':
        return (
          <>
            <ProfileHeader
              displayName={account.display_name}
              bio={account.bio}
              shortBio={account.short_bio}
              profileImage={account.profile_image_signed_url}
              isVerified={account.is_verified}
              backgroundColor={account.background_color}
              backgroundImageUrl={account.background_image_signed_url}
              textColor={account.background_text_color}
            />
            
            {/* Preview notice */}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Profile Basics Preview
              </Typography>
            </Box>
          </>
        )
      
      case 'social-links':
        return (
          <>
            <ProfileSocial
              instagram={account.instagram_url}
              twitter={account.twitter_url}
              tiktok={account.tiktok_url}
              youtube={account.youtube_url}
              farcaster={account.farcaster_url}
              website={account.website_url}
              blog={account.blog_url}
              stream={account.stream_url}
              telegram={account.telegram_url}
              discord={account.discord_url}
            />
            
            {/* Preview notice */}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Social Links Preview
              </Typography>
            </Box>
          </>
        )
      
      case 'banner':
        return (
          <>
            {(account.banner_title || account.banner_image_signed_url || account.banner_color) && (
              <ProfileBanner
                title={account.banner_title}
                color={account.banner_color}
                buttonText={account.banner_button_text}
                buttonLink={account.banner_button_link}
                imageUrl={account.banner_image_signed_url}
              />
            )}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Banner Preview
              </Typography>
            </Box>
          </>
        )
      
      case 'goals':
        return (
          <>
            {goal && goal.is_visible && (
              <ProfileGoals
                goal={goal}
                backgroundColor={account.background_color}
                backgroundImageUrl={account.background_image_signed_url}
                textColor={account.background_text_color}
              />
            )}
            
            {/* Preview notice */}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Goals Preview
              </Typography>
            </Box>
          </>
        )
      
      case 'gallery':
        return (
          <>
            {media && media.length > 0 && (
              <ProfileGallery media={media} />
            )}
            {/* Preview notice */}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Media Gallery Preview
              </Typography>
            </Box>
          </>
        )
      
      case 'links':
        return (
          <>
            {links && links.length > 0 && (
              <ProfileLinks
                links={links}
                backgroundColor={account.background_color}
                backgroundImageUrl={account.background_image_signed_url}
                linkSectionTitle={account.link_section_title}
                textColor={account.background_text_color}
              />
            )}
            {/* Preview notice */}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Links Section Preview
              </Typography>
            </Box>
          </>
        )
      
      case 'support-settings':
        return (
          <>
            <ProfileSupport
              displayLink={account.display_link || 'preview'}
              backgroundColor={account.background_color}
              backgroundImageUrl={account.background_image_signed_url}
              supportImage={account.support_image}
              supportTitle={account.support_title}
              supportMessage={account.support_message}
              customDonationAmount1={paymentAmounts.amount1}
              customDonationAmount2={paymentAmounts.amount2}
              customDonationAmount3={paymentAmounts.amount3}
              textColor={account.background_text_color}
            />
            
            {/* Preview notice */}
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                ✨ Support Settings Preview ({account.payment_model || 'donations'} mode)
              </Typography>
            </Box>
          </>
        )
      
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Preview will appear here...
            </Typography>
          </Box>
        )
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        backgroundColor: account.background_color || '#667eea',
        backgroundImage: account.background_image_signed_url 
          ? `url(${account.background_image_signed_url})` 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Dark overlay for better text readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      />
      
      {/* Content */}
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        {renderStepPreview()}
      </Container>
    </Box>
  )
}