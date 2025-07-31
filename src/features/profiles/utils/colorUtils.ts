// Determine if a color is light or dark
export function isLightColor(backgroundColor: string): boolean {
    // If it's rgba with transparency, assume it's light if opacity < 0.5
    if (backgroundColor.startsWith('rgba')) {
      const parts = backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (parts && parseFloat(parts[4]) < 0.5) {
        return true;
      }
    }
    
    // Extract RGB values
    let r = 0, g = 0, b = 0;
    
    // Handle different color formats
    if (backgroundColor.startsWith('#')) {
      // Hex color
      const hex = backgroundColor.slice(1);
      const bigint = parseInt(hex, 16);
      r = (bigint >> 16) & 255;
      g = (bigint >> 8) & 255;
      b = bigint & 255;
    } 
    else if (backgroundColor.startsWith('rgb')) {
      // RGB color
      const parts = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (parts) {
        r = parseInt(parts[1], 10);
        g = parseInt(parts[2], 10);
        b = parseInt(parts[3], 10);
      }
    }
    
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Consider "light" if brightness is greater than 0.5
    return brightness > 0.5;
  }

// Utility to analyze background and determine appropriate text/UI colors
export function getContrastColors(backgroundColor = null, backgroundImageUrl = null) {
  // If there's a background image, we should use dark text (for our yellow background case)
  if (backgroundImageUrl) {
    return {
      textColor: 'rgba(0, 0, 0, 0.87)',
      subtleTextColor: 'rgba(0, 0, 0, 0.6)',
      uiElementColor: 'rgba(255, 255, 255, 0.25)', // Lower opacity for glassmorphism
      uiBorderColor: 'rgba(0, 0, 0, 0.12)',
      uiBackgroundColor: 'rgba(255, 255, 255, 0.15)' // Very transparent for glassmorphism
    };
  }
  
  // If no background image but has a color, analyze the color
  if (backgroundColor) {
    // Extract RGB values for color analysis
    let r = 0, g = 0, b = 0;
    
    // Handle hex colors
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.slice(1);
      const bigint = parseInt(hex, 16);
      r = (bigint >> 16) & 255;
      g = (bigint >> 8) & 255;
      b = bigint & 255;
    } 
    // Handle rgb/rgba colors
    else if (backgroundColor.startsWith('rgb')) {
      const parts = backgroundColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (parts) {
        r = parseInt(parts[1], 10);
        g = parseInt(parts[2], 10);
        b = parseInt(parts[3], 10);
      }
    }
    
    // Calculate perceived brightness using YIQ formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 
      ? {
          textColor: 'rgba(0, 0, 0, 0.87)',
          subtleTextColor: 'rgba(0, 0, 0, 0.6)',
          uiElementColor: 'rgba(255, 255, 255, 0.25)', // Lower opacity for glassmorphism
          uiBorderColor: 'rgba(0, 0, 0, 0.12)',
          uiBackgroundColor: 'rgba(255, 255, 255, 0.15)' // Very transparent for glassmorphism
        }
      : {
          textColor: 'rgba(255, 255, 255, 0.87)',
          subtleTextColor: 'rgba(255, 255, 255, 0.6)',
          uiElementColor: 'rgba(0, 0, 0, 0.25)', // Lower opacity for glassmorphism
          uiBorderColor: 'rgba(255, 255, 255, 0.15)',
          uiBackgroundColor: 'rgba(30, 30, 30, 0.15)' // Very transparent for glassmorphism
        };
  }
  
  // Default to dark mode if no background detected
  return {
    textColor: 'rgba(255, 255, 255, 0.87)',
    subtleTextColor: 'rgba(255, 255, 255, 0.6)',
    uiElementColor: 'rgba(0, 0, 0, 0.25)', // Lower opacity for glassmorphism
    uiBorderColor: 'rgba(255, 255, 255, 0.15)',
    uiBackgroundColor: 'rgba(30, 30, 30, 0.15)' // Very transparent for glassmorphism
  };
}