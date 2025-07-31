import  { useEffect } from 'react';
import { Box } from '@mui/material';

interface InstagramEmbedProps {
  url: string;
  title?: string;
}

export default function InstagramEmbed({ url, title = "Instagram post" }: InstagramEmbedProps) {
  useEffect(() => {
    // Load Instagram embed script
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Box sx={{
      maxWidth: '540px',
      margin: '0 auto',
      '& .instagram-media': {
        borderRadius: '16px !important',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
      }
    }}>
      <blockquote 
        className="instagram-media" 
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '16px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '1px',
          maxWidth: '540px',
          minWidth: '326px',
          padding: 0,
          width: 'calc(100% - 2px)'
        }}
      >
        <div style={{ padding: '16px' }}>
          <a 
            href={url}
            style={{
              background: '#FFFFFF',
              lineHeight: 0,
              padding: '0 0',
              textAlign: 'center',
              textDecoration: 'none',
              width: '100%'
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            View this post on Instagram
          </a>
        </div>
      </blockquote>
    </Box>
  );
}