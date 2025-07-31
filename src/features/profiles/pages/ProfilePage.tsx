import React from 'react';
import { useParams } from '@tanstack/react-router';
import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useProfile } from '../hooks/useProfile';
import ProfileNavbar from '../components/ProfileNavbar';
import ProfileHeader from '../components/ProfileHeader';
import ProfileGallery from '../components/ProfileGallery';
import ProfileLinks from '../components/ProfileLinks';
import ProfileSocial from '../components/ProfileSocial';
import ProfileBanner from '../components/ProfileBanner';
import ProfileSupport from '../components/ProfileSupport';
import ProfileComments from '../components/ProfileComments';
import ProfileGoals from '../components/ProfileGoals';
import ProfileMetadata from '../components/ProfileMetadata';
import ProfileLoading from '../components/ProfileLoading';
import ProfileFooter from '../components/ProfileFooter';
import { getRandomBackgroundImage } from '../utils/backgroundUtils';

export default function ProfilePage() {
  const { displayLink } = useParams({ from: '/i/$displayLink' });
  const { profile, loading, error } = useProfile(displayLink || '');
  const theme = useTheme();

  // Helper function to get payment amounts based on payment model
  const getPaymentAmounts = () => {
    if (!profile?.account) return { amount1: 5, amount2: 10, amount3: 25 };

    const account = profile.account;
    
    if (account.payment_model === 'donations') {
      // ✅ Fix: Access donation_amounts from root level, not account level
      return {
        amount1: Math.round(profile.donation_amounts?.amount_1 || 5),
        amount2: Math.round(profile.donation_amounts?.amount_2 || 10),
        amount3: Math.round(profile.donation_amounts?.amount_3 || 25)
      };
    } else {
      // For subscriptions, we don't need to use these amounts, 
      // but return defaults to avoid breaking the donation UI
      return {
        amount1: 5,
        amount2: 10, 
        amount3: 25
      };
    }
  };

  if (loading) return <ProfileLoading />;

  if (error || !profile) return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white' 
    }}>
      <Typography variant="h4">Profile not found</Typography>
    </Box>
  );

  if (!profile.account) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white' 
      }}>
        <Typography variant="h4">Profile data not available</Typography>
      </Box>
    );
  }

  // Safe display link for passing to components
  const safeDisplayLink = displayLink || '';
  
  // Get payment amounts based on payment model
  const paymentAmounts = getPaymentAmounts();

  console.log('🔍 Payment Model Debug:', {
    payment_model: profile.account.payment_model,
    donation_amounts: profile.donation_amounts,
    subscription_pricing: profile.account.subscription_pricing,
    calculated_amounts: paymentAmounts
  });

  return (
    <>
      {/* Dedicated Metadata Component - No more Symbol conversion issues! */}
      <ProfileMetadata profile={profile} displayLink={safeDisplayLink} />

      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: profile.account.background_image_signed_url 
            ? `url(${profile.account.background_image_signed_url})`
            : `url(${getRandomBackgroundImage()})`,
          backgroundColor: profile.account.background_color || theme.palette.background.default,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: { xs: 2, sm: 3, md: 4 },
          paddingTop: { xs: 10, sm: 11, md: 12 },
          overflow: 'auto'
        }}
      >
        <ProfileNavbar
          backgroundColor={profile.account.background_color || null}
          backgroundImageUrl={profile.account.background_image_signed_url || null}
          textColor={profile.account.background_text_color}
          displayLink={safeDisplayLink}
          displayName={profile.account.display_name}
          bio={profile.account.bio}
          profileImageSignedUrl={profile.account.profile_image_signed_url}
          accountType={profile.account.account_type}
        />

        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 5 },
            mt: { xs: 2, md: 4 }
          }}>
            
            {/* Mobile: Single Column with Custom Order */}
            <Box sx={{ 
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              gap: 3,
            }}>
              {/* 1. Profile */}
              <ProfileHeader 
                displayName={profile.account.display_name}
                shortBio={profile.account.short_bio}
                bio={profile.account.bio}
                profileImage={profile.account.profile_image_signed_url}
                isVerified={profile.account.is_verified}
                backgroundColor={profile.account.background_color}
                backgroundImageUrl={profile.account.background_image_signed_url}
                textColor={profile.account.background_text_color}
              />
              
              {/* 2. Social */}
              <ProfileSocial 
                instagram={profile.account.instagram_url}
                twitter={profile.account.twitter_url}
                tiktok={profile.account.tiktok_url}
                youtube={profile.account.youtube_url}
                farcaster={profile.account.farcaster_url}
                website={profile.account.website_url}
                blog={profile.account.blog_url}
                stream={profile.account.stream_url}
                telegram={profile.account.telegram_url}
                discord={profile.account.discord_url}
                isVerified={profile.account.is_verified}
              />
              
              {/* 3. Support - Updated with payment model logic */}
              <ProfileSupport 
                displayLink={safeDisplayLink}
                backgroundColor={profile.account.background_color || null} 
                backgroundImageUrl={profile.account.background_image_signed_url || null}
                supportImage={profile.account.support_image}
                supportTitle={profile.account.support_title}
                supportMessage={profile.account.support_message}
                customDonationAmount1={paymentAmounts.amount1}
                customDonationAmount2={paymentAmounts.amount2}
                customDonationAmount3={paymentAmounts.amount3}
                paymentModel={profile.account.payment_model}
                subscriptionMonthlyPrice={profile.account.subscription_pricing?.monthly_price || 10}
                subscriptionQuarterlyPrice={profile.account.subscription_pricing?.quarterly_price || 27}
                subscriptionYearlyPrice={profile.account.subscription_pricing?.yearly_price || 80}
                isVerified={profile.account.is_verified}
                textColor={profile.account.background_text_color}
              />
              
              {/* 4. Goals */}
              {profile.goal && (
                <ProfileGoals 
                  goal={profile.goal}
                  backgroundColor={profile.account.background_color || null}
                  backgroundImageUrl={profile.account.background_image_signed_url || null}
                  textColor={profile.account.background_text_color}
                />
              )}
              
              {/* 5. Gallery */}
              <ProfileGallery media={profile.media} />
              
              {/* 6. Banner */}
              {profile.account.banner_image_signed_url && (
                <ProfileBanner 
                  title={profile.account.banner_title}
                  color={profile.account.banner_color}
                  buttonText={profile.account.banner_button_text}
                  buttonLink={profile.account.banner_button_link}
                  imageUrl={profile.account.banner_image_signed_url}
                />
              )}
              
              {/* 7. Comments */}
              <ProfileComments 
                displayLink={safeDisplayLink}
                displayName={profile.account.display_name}
                backgroundColor={profile.account.background_color || null} 
                backgroundImageUrl={profile.account.background_image_signed_url || null}
                textColor={profile.account.background_text_color}
                accountType={profile.account.account_type}
              />
              
              {/* 8. Links */}
              <ProfileLinks 
                links={profile.links} 
                backgroundColor={profile.account.background_color || null} 
                backgroundImageUrl={profile.account.background_image_signed_url || null}
                textColor={profile.account.background_text_color}
              />
            </Box>

            {/* Desktop: Two-Column Layout */}
            <>
              {/* Left Column - Desktop Only */}
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 420px' },
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 3,
                position: 'relative',
              }}>
                <ProfileGallery media={profile.media} />
                <ProfileHeader 
                  displayName={profile.account.display_name}
                  shortBio={profile.account.short_bio}
                  bio={profile.account.bio}
                  profileImage={profile.account.profile_image_signed_url}
                  isVerified={profile.account.is_verified}
                  backgroundColor={profile.account.background_color}
                  backgroundImageUrl={profile.account.background_image_signed_url}
                  textColor={profile.account.background_text_color}
                />
                <ProfileSocial 
                  instagram={profile.account.instagram_url}
                  twitter={profile.account.twitter_url}
                  tiktok={profile.account.tiktok_url}
                  youtube={profile.account.youtube_url}
                  farcaster={profile.account.farcaster_url}
                  website={profile.account.website_url}
                  blog={profile.account.blog_url}
                  stream={profile.account.stream_url}
                  telegram={profile.account.telegram_url}
                  discord={profile.account.discord_url}
                  isVerified={profile.account.is_verified}
                />
                {profile.goal && (
                  <ProfileGoals 
                    goal={profile.goal}
                    backgroundColor={profile.account.background_color || null}
                    backgroundImageUrl={profile.account.background_image_signed_url || null}
                    textColor={profile.account.background_text_color}
                  />
                )}
                <ProfileComments 
                  displayLink={safeDisplayLink}
                  displayName={profile.account.display_name}
                  backgroundColor={profile.account.background_color || null}
                  backgroundImageUrl={profile.account.background_image_signed_url || null}
                  textColor={profile.account.background_text_color}
                  accountType={profile.account.account_type}
                />
              </Box>
              
              {/* Right Column - Desktop Only */}
              <Box sx={{ 
                flex: '1',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: { xs: 3, md: 3 },
              }}>
                {profile.account.banner_image_signed_url && (
                  <ProfileBanner 
                    title={profile.account.banner_title}
                    color={profile.account.banner_color}
                    buttonText={profile.account.banner_button_text}
                    buttonLink={profile.account.banner_button_link}
                    imageUrl={profile.account.banner_image_signed_url}
                  />
                )}
                {/* Support - Updated with payment model logic */}
                <ProfileSupport 
                  displayLink={safeDisplayLink}
                  backgroundColor={profile.account.background_color || null} 
                  backgroundImageUrl={profile.account.background_image_signed_url || null}
                  supportImage={profile.account.support_image}
                  supportTitle={profile.account.support_title}
                  supportMessage={profile.account.support_message}
                  customDonationAmount1={paymentAmounts.amount1}
                  customDonationAmount2={paymentAmounts.amount2}
                  customDonationAmount3={paymentAmounts.amount3}
                  paymentModel={profile.account.payment_model}
                  subscriptionMonthlyPrice={profile.account.subscription_pricing?.monthly_price || 10}
                  subscriptionQuarterlyPrice={profile.account.subscription_pricing?.quarterly_price || 27}
                  subscriptionYearlyPrice={profile.account.subscription_pricing?.yearly_price || 80}
                  isVerified={profile.account.is_verified}
                  textColor={profile.account.background_text_color}
                />
                <ProfileLinks 
                  links={profile.links} 
                  backgroundColor={profile.account.background_color || null} 
                  backgroundImageUrl={profile.account.background_image_signed_url || null}
                  textColor={profile.account.background_text_color}
                />
              </Box>
            </>
          </Box>
          
          {/* Glassmorphic Footer */}
          <ProfileFooter textColor={profile.account.background_text_color} />
        </Container>
      </Box>
    </>
  );
}
