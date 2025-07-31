import { Box, Typography, Avatar, Tooltip } from '@mui/material';


interface ProfileHeaderProps {
  displayName: string;
  shortBio: string;
  bio: string;
  profileImage: string;
  isVerified?: boolean;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
  textColor?: string | null;
}

// Function to get a consistent fallback avatar based on display name
const getFallbackAvatar = (displayName: string): string => {
  const profileImages = [
    '/images/profiles/1.jpg',
    '/images/profiles/2.jpg', 
    '/images/profiles/3.jpg',
    '/images/profiles/4.png',
    '/images/profiles/5.png',
    '/images/profiles/6.png',
    '/images/profiles/7.png',
    '/images/profiles/8.png',
    '/images/profiles/9.png',
    '/images/profiles/10.png',
    '/images/profiles/11.jpg',
    '/images/profiles/12.png',
    '/images/profiles/13.jpg',
    '/images/profiles/14.png',
    '/images/profiles/15.png',
    '/images/profiles/16.png',
    '/images/profiles/17.jpeg',
    '/images/profiles/18.png',
    '/images/profiles/19.png',
    '/images/profiles/20.png',
    '/images/profiles/21.jpeg',
    '/images/profiles/22.png',
    '/images/profiles/23.png',
    '/images/profiles/24.jpg',
    '/images/profiles/25.jpg',
    '/images/profiles/26.jpeg',
    '/images/profiles/27.jpg',
    '/images/profiles/28.png',
    '/images/profiles/29.png',
    '/images/profiles/30.png',
    '/images/profiles/31.png',
    '/images/profiles/32.png'
  ];

  // Generate consistent index based on display name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    const char = displayName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % profileImages.length;
  return profileImages[index];
};

export default function ProfileHeader({ 
  displayName, 
  shortBio, 
  bio, 
  profileImage,
  isVerified = false,
  backgroundColor = null,
  backgroundImageUrl = null,
  textColor = null
}: ProfileHeaderProps) {
  
  // Get fallback image if no profile image provided
  const avatarSrc = profileImage || getFallbackAvatar(displayName);
  
  return (
    <Box sx={{ 
      // backdropFilter: 'blur(24px)',
      // WebkitBackdropFilter: 'blur(24px)',
      // backgroundColor: 'rgba(255, 255, 255, 0.15)',
      background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
      backdropFilter: 'blur(50px)',
      borderRadius: '36px',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Avatar 
          src={avatarSrc}
          alt={displayName}
          sx={{ 
            width: 120, 
            height: 120,
            border: '4px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.2)',
          }}
        />
        
        {isVerified && (
          <Tooltip title="Verified" arrow>
            <Box
              component="img"
              src="/images/verified.png"
              alt="Verified"
              sx={{ 
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 28,
                height: 28,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
                },
                transition: 'all 0.2s ease-in-out',
              }} 
            />
          </Tooltip>
        )}
      </Box>
      
      <Typography 
        variant="h4" 
        fontWeight={700} 
        mb={1}
        sx={{ 
          mixBlendMode: 'difference',
          color: textColor || '#ffffff', 
          textShadow:'-.4px -.4px 0 #000, .4px -.4px 0 #000, -.4px .4px 0 #000,.4px .4px 0 #000,.4px 0px 0 #000, .4px 0px 0 #000' }}
      >
        {displayName}
      </Typography>
      
      <Typography 
        variant="subtitle1" 
        mb={2} 
        fontWeight={500}
        sx={{ 
          // mixBlendMode: 'difference',
          color: textColor || 'white',
          textShadow:'-.1px -.1px 0 #000, .1px -.1px 0 #000, -.1px .1px 0 #000,.1px .1px 0 #000,.1px 0px 0 #000, .1px 0px 0 #000' }}
        
      >
        {shortBio}
      </Typography>
      
      <Typography 
        variant="body2"
        sx={{
          mixBlendMode: 'difference',
          color: textColor || 'white' }}
      >
        {bio}
      </Typography>
    </Box>
  );
}
