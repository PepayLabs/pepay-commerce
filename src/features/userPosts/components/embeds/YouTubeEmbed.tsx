import { Box } from '@mui/material';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export default function YouTubeEmbed({ url, title = "YouTube video" }: YouTubeEmbedProps) {
  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string): string | null => {
    const regexes = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) return match[1];
    }
    return null;
  };

  const videoId = getVideoId(url);
  if (!videoId) return null;

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
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
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