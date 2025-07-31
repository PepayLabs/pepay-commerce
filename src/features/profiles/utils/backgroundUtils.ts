/**
 * Background utility functions for profile and content pages
 */

/**
 * Generate a random background image from the available background collection
 * @returns string - Path to a random background image
 */
export const getRandomBackgroundImage = (): string => {
  const randomNum = Math.floor(Math.random() * 7) + 1; // 1-7 (bg1-min.png to bg7-min.png)
  return `/images/background/bg${randomNum}-min.png`;
};

/**
 * Get the appropriate background image URL, falling back to random if none provided
 * @param backgroundImageUrl - Optional background image URL
 * @param useRandomFallback - Whether to use random background if no image provided
 * @returns string | null - Background image URL or null
 */
export const getBackgroundImageUrl = (
  backgroundImageUrl?: string | null, 
  useRandomFallback: boolean = true
): string | null => {
  if (backgroundImageUrl) {
    return backgroundImageUrl;
  }
  
  return useRandomFallback ? getRandomBackgroundImage() : null;
};

/**
 * Get appropriate background color when no background image is available
 * @param backgroundColor - Optional background color
 * @returns string - Background color or gradient
 */
export const getBackgroundColor = (backgroundColor?: string | null): string => {
  return backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

/**
 * Generate CSS background style with proper fallbacks
 * @param backgroundImageUrl - Background image URL
 * @param backgroundColor - Background color
 * @param useRandomFallback - Whether to use random background images
 * @param overlay - Optional overlay for background images
 * @returns string - CSS background style
 */
export const getBackgroundStyle = (
  backgroundImageUrl?: string | null,
  backgroundColor?: string | null,
  useRandomFallback: boolean = true,
  overlay: string = 'rgba(0, 0, 0, 0.2)'
): string => {
  const finalImageUrl = getBackgroundImageUrl(backgroundImageUrl, useRandomFallback);
  
  if (finalImageUrl) {
    return `linear-gradient(${overlay}, ${overlay}), url(${finalImageUrl}) center/cover`;
  }
  
  return getBackgroundColor(backgroundColor);
}; 