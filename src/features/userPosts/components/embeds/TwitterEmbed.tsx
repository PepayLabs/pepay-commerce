import  { useEffect } from 'react';
import { Box } from '@mui/material';

interface TwitterEmbedProps {
  url: string;
  title?: string;
}

export default function TwitterEmbed({ url, title = "Tweet" }: TwitterEmbedProps) {
  useEffect(() => {
    // Load Twitter widgets script
    if (window.twttr) {
      window.twttr.widgets.load();
    } else {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Box sx={{
      '& .twitter-tweet': {
        margin: '0 auto !important',
        borderRadius: '16px !important',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      }
    }}>
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={url} rel="noopener noreferrer">
          {title}
        </a>
      </blockquote>
    </Box>
  );
}