import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  IconButton, 
  Typography, 
  Button,
  Fade,
  useMediaQuery,
  useTheme,
  Chip,
  Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CodeIcon from '@mui/icons-material/Code';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ContentItem, ContentAccount } from '../types/content.types';
import BrandedVideoPlayer from '../../userPosts/components/BrandedVideoPlayer';

interface ContentViewerModalProps {
  content: ContentItem | null;
  account: ContentAccount | null;
  open: boolean;
  onClose: () => void;
  onPurchase?: (content: ContentItem, account: ContentAccount) => void;
  onLike?: (contentId: string) => void;
  onShare?: (contentId: string) => void;
  onDownload?: (contentId: string) => void;
  isLiked?: boolean;
  canDownload?: boolean;
}

export default function ContentViewerModal({
  content,
  account,
  open,
  onClose,
  onPurchase,
  onLike,
  onShare,
  onDownload,
  isLiked = false,
  canDownload = false
}: ContentViewerModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [imageZoom, setImageZoom] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-hide controls for immersive viewing
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => setShowControls(false), 3000);
    setControlsTimeout(timer);
  }, [open, showControls]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    setShowControls(true);
    
    const timeout = setTimeout(() => setShowControls(false), 3000);
    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  // Prevent right-click and other download methods
  const preventContextMenu = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const preventKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    // Prevent common download shortcuts
    if (
      (e.ctrlKey || e.metaKey) && 
      (e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent F12 (dev tools)
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Prevent Ctrl+Shift+I (dev tools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    if (open && modalRef.current) {
      const modalElement = modalRef.current;
      
      // Add event listeners for content protection
      modalElement.addEventListener('contextmenu', preventContextMenu);
      modalElement.addEventListener('dragstart', preventContextMenu);
      modalElement.addEventListener('selectstart', preventContextMenu);
      document.addEventListener('keydown', preventKeyboardShortcuts);
      
      // Disable text selection
      modalElement.style.userSelect = 'none';
      modalElement.style.webkitUserSelect = 'none';
      
      return () => {
        modalElement.removeEventListener('contextmenu', preventContextMenu);
        modalElement.removeEventListener('dragstart', preventContextMenu);
        modalElement.removeEventListener('selectstart', preventContextMenu);
        document.removeEventListener('keydown', preventKeyboardShortcuts);
      };
    }
  }, [open, preventContextMenu, preventKeyboardShortcuts]);

  // Close modal on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  if (!content || !account) return null;

  const hasAccess = content.has_access || content.is_purchased;
  const canView = hasAccess || content.is_public;

  const handlePurchaseClick = () => {
    if (onPurchase) {
      onPurchase(content, account);
    }
  };

  const handleDownload = async () => {
    if (!content.file_url) return;
    
    try {
      const response = await fetch(content.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.title}.${content.file_mime_type?.split('/')[1] || 'file'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const renderVideoContent = () => (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'black'
    }}>
      <BrandedVideoPlayer
        src={content.file_url!}
        poster={content.cover_image_url}
        title={content.title}
        creatorName={account.display_link}
        textColor={account.background_text_color}
      />
    </Box>
  );

  const renderImageContent = () => (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'black',
        overflow: 'hidden',
        cursor: imageZoom < 3 ? 'zoom-in' : 'zoom-out'
      }}
      onClick={() => {
        if (imageZoom < 3) {
          setImageZoom(prev => Math.min(prev + 0.5, 3));
        } else {
          setImageZoom(1);
        }
        resetControlsTimer();
      }}
    >
      <img
        src={content.file_url!}
        alt={content.title}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transform: `scale(${imageZoom})`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        }}
        onContextMenu={preventContextMenu}
      />
      
      {/* Zoom Controls */}
      <Fade in={showControls} timeout={300}>
        <Box sx={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          p: 1,
        }}>
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              setImageZoom(prev => Math.max(prev - 0.5, 0.5));
            }}
            disabled={imageZoom <= 0.5}
            sx={{ color: 'white' }}
          >
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2" sx={{ 
            color: 'white', 
            alignSelf: 'center',
            minWidth: 40,
            textAlign: 'center'
          }}>
            {Math.round(imageZoom * 100)}%
          </Typography>
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              setImageZoom(prev => Math.min(prev + 0.5, 3));
            }}
            disabled={imageZoom >= 3}
            sx={{ color: 'white' }}
          >
            <ZoomInIcon />
          </IconButton>
        </Box>
      </Fade>
    </Box>
  );

  const renderAudioContent = () => (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'black',
      position: 'relative'
    }}>
      {/* Album Art/Cover */}
      <Box sx={{ 
        width: isMobile ? 280 : 400,
        height: isMobile ? 280 : 400,
        borderRadius: 4,
        overflow: 'hidden',
        mb: 4,
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)'
      }}>
        <img
          src={content.cover_image_url}
          alt={content.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </Box>

      {/* Audio Player */}
      <Box sx={{ width: '100%', maxWidth: 600, px: 3 }}>
        <audio 
          controls 
          src={content.file_url!}
          style={{
            width: '100%',
            height: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
          }}
          onContextMenu={preventContextMenu}
        />
      </Box>
    </Box>
  );

  const renderFileContent = () => (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#1e1e1e',
      color: 'white'
    }}>
      {/* File Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {content.title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {content.file_mime_type} • {(content.file_size_bytes / 1024 / 1024).toFixed(2)} MB
        </Typography>
      </Box>

      {/* File Content Preview */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {content.file_mime_type?.includes('text') ? (
          <Box sx={{
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            background: 'rgba(0, 0, 0, 0.3)',
            p: 2,
            borderRadius: 2
          }}>
            {/* Preview of file content would go here */}
            <Typography sx={{ opacity: 0.7 }}>
              File preview available after download
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="body1" sx={{ opacity: 0.7, mb: 2 }}>
              Preview not available for this file type
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2
              }}
            >
              Download File
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderPurchaseOverlay = () => (
    <Box sx={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 100%)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      textAlign: 'center',
      p: 4
    }}>
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        borderRadius: '50%',
        p: 3,
        mb: 3,
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        <ShoppingCartIcon sx={{ fontSize: 48, color: 'white' }} />
      </Box>
      
      <Typography variant="h4" sx={{ 
        color: 'white', 
        fontWeight: 700, 
        mb: 2,
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}>
        Purchase to Access
      </Typography>
      
      <Typography variant="body1" sx={{ 
        color: 'rgba(255, 255, 255, 0.8)', 
        mb: 4,
        maxWidth: 400
      }}>
        Get full access to "{content.title}" and support {account.display_name}
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<ShoppingCartIcon />}
        onClick={handlePurchaseClick}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          px: 4,
          py: 1.5,
          borderRadius: 3,
          textTransform: 'none',
          fontSize: '1.1rem',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
          }
        }}
      >
        Purchase for ${content.price}
      </Button>
    </Box>
  );

  const renderContent = () => {
    if (!canView && !hasAccess) {
      return renderPurchaseOverlay();
    }

    switch (content.content_type) {
      case 'video':
        return renderVideoContent();
      case 'image':
        return renderImageContent();
      case 'audio':
        return renderAudioContent();
      case 'code':
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
              borderRadius: '16px',
              p: 4,
            }}
          >
            <CodeIcon sx={{ fontSize: 80, color: '#48bb78', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              Code Content
            </Typography>
            <Chip
              label="View Code"
              variant="outlined"
              sx={{
                color: '#48bb78',
                borderColor: '#48bb78',
                '&:hover': {
                  backgroundColor: 'rgba(72, 187, 120, 0.1)',
                },
              }}
            />
          </Box>
        );
      default:
        return renderFileContent();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'black',
          backgroundImage: 'none',
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogContent sx={{ p: 0, position: 'relative', height: '100vh' }}>
        {/* Top Controls Bar */}
        <Fade in={showControls} timeout={300}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
            p: 2,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {content.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  by @{account.display_name}
                </Typography>
              </Box>
            </Box>

            {hasAccess && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => setIsFavorited(!isFavorited)}
                  sx={{ color: 'white' }}
                >
                  {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <ShareIcon />
                </IconButton>
                {content.file_url && (
                  <IconButton onClick={handleDownload} sx={{ color: 'white' }}>
                    <DownloadIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        </Fade>

        {/* Content Area */}
        <Box 
          sx={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }}
          onMouseMove={resetControlsTimer}
          onTouchStart={resetControlsTimer}
        >
          {renderContent()}
          {!hasAccess && !content.is_public && renderPurchaseOverlay()}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
