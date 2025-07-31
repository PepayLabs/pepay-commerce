import { Box } from '@mui/material';

interface VimeoEmbedProps {
  url: string;
  title?: string;
}

export default function VimeoEmbed({ url, title = "Vimeo video" }: VimeoEmbedProps) {
  return (
    <Box sx={{
      position: 'relative',
      paddingBottom: '56.25%', // 16:9 aspect ratio
      height: 0,
      overflow: 'hidden',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
    }}>
      <iframe
        src={url}
        title={title}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '16px'
        }}
      />
    </Box>
  );
}