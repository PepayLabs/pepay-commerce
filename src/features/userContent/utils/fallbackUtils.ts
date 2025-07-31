import { ContentItem } from '../types/content.types';

// Your existing profile image collection
const PROFILE_IMAGES = [
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

// Beautiful gradient collections for content covers only
const CONTENT_GRADIENTS = {
  video: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ],
  audio: [
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  ],
  image: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    'linear-gradient(135deg, #48cae4 0%, #023e8a 100%)',
    'linear-gradient(135deg, #06ffa5 0%, #0079ff 100%)',
    'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
  ],
};

// Neutral gradients for backgrounds
const BACKGROUND_GRADIENTS = [
  'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
  'linear-gradient(135deg, #485563 0%, #29323c 100%)',
  'linear-gradient(135deg, #000428 0%, #004e92 100%)',
];

// Generate consistent hash from string
function generateHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get consistent random profile image from your collection
 * Works with displayLink, walletAddress, or any identifier
 */
export function getProfileImageFallback(identifier: string): string {
  const hash = generateHash(identifier);
  const index = hash % PROFILE_IMAGES.length;
  return PROFILE_IMAGES[index];
}

/**
 * Get beautiful fallback cover for content items (gradients + icons)
 */
export function getContentCoverFallback(content: ContentItem): {
  backgroundImage: string;
  icon: React.ReactNode;
  iconColor: string;
} {
  const gradients = CONTENT_GRADIENTS[content.content_type] || CONTENT_GRADIENTS.image;
  const hash = generateHash(content.content_id);
  const gradient = gradients[hash % gradients.length];
  
  // Content type icons
  const icons = {
    video: '🎬',
    audio: '🎵', 
    image: '🖼️',
  };
  
  return {
    backgroundImage: gradient,
    icon: icons[content.content_type] || '📄',
    iconColor: 'rgba(255, 255, 255, 0.9)'
  };
}

/**
 * Get beautiful fallback background for profiles
 */
export function getProfileBackgroundFallback(identifier: string): string {
  const hash = generateHash(identifier);
  const index = hash % BACKGROUND_GRADIENTS.length;
  return BACKGROUND_GRADIENTS[index];
}

/**
 * Enhanced pattern overlay for extra sophistication
 */
export function getPatternOverlay(opacity: number = 0.1): string {
  return `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='${opacity}'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;
}

/**
 * Glassmorphism effect for content cards
 */
export function getGlassmorphismStyle(backgroundImage?: string) {
  return {
    background: backgroundImage ? 
      `linear-gradient(156.52deg, rgba(255, 255, 255, 0.2) 2.12%, rgba(255, 255, 255, 0.05) 54.33%, rgba(255, 255, 255, 0.2) 93.02%)` :
      `linear-gradient(156.52deg, rgba(255, 255, 255, 0.1) 2.12%, rgba(255, 255, 255, 0.05) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)`,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };
}
