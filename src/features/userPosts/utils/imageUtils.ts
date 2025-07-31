// Shared fallback logic
export const getRandomBackgroundImage = (): string => {
    const randomNum = Math.floor(Math.random() * 7) + 1; // 1-7
    return `/images/background/bg${randomNum}-min.png`;
  };
  
  export const getFallbackAvatar = (displayName: string): string => {
    const profileImages = [
      '/images/profiles/1.jpg', '/images/profiles/2.jpg', '/images/profiles/3.jpg',
      '/images/profiles/4.png', '/images/profiles/5.png', '/images/profiles/6.png',
      '/images/profiles/7.png', '/images/profiles/8.png', '/images/profiles/9.png',
      '/images/profiles/10.png', '/images/profiles/11.jpg', '/images/profiles/12.png',
      '/images/profiles/13.jpg', '/images/profiles/14.png', '/images/profiles/15.png',
      '/images/profiles/16.png', '/images/profiles/17.jpeg', '/images/profiles/18.png',
      '/images/profiles/19.png', '/images/profiles/20.png', '/images/profiles/21.jpeg',
      '/images/profiles/22.png', '/images/profiles/23.png', '/images/profiles/24.jpg',
      '/images/profiles/25.jpg', '/images/profiles/26.jpeg', '/images/profiles/27.png',
      '/images/profiles/28.jpg', '/images/profiles/29.jpg', '/images/profiles/30.png',
      '/images/profiles/31.png', '/images/profiles/32.png'
    ];
  
    // Generate consistent index based on display name
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
      const char = displayName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const index = Math.abs(hash) % profileImages.length;
    return profileImages[index];
  };