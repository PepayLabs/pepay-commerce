import { useState, useEffect } from 'react';
import { getContrastColors } from '../utils/colorUtils';

export function useContrastColors(backgroundColor = null, backgroundImageUrl = null) {
  const [colors, setColors] = useState(getContrastColors(backgroundColor, backgroundImageUrl));
  
  useEffect(() => {
    setColors(getContrastColors(backgroundColor, backgroundImageUrl));
  }, [backgroundColor, backgroundImageUrl]);
  
  return colors;
}