import { Box } from '@mui/material';

interface TikTokEmbedProps {
  url: string;
  title?: string;
}

export default function TikTokEmbed({ url, title = "TikTok video" }: TikTokEmbedProps) {
  return (
    <Box
      sx={{
        maxWidth: '100%',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        // backgroundColor: '#fff',
      }}
    >
      <iframe
        src={url}
        width="100%"
        height="800"
        frameBorder="0"
        allow="autoplay; fullscreen"
        allowFullScreen
        loading="lazy"
        title={title}
        style={{ 
          borderRadius: '16px',
          border: 'none'
        }}
      />
    </Box>
  );
}