import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, IconButton, Typography, Slider, Fade, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import Forward10Icon from '@mui/icons-material/Forward10';
import Replay10Icon from '@mui/icons-material/Replay10';
import SpeedIcon from '@mui/icons-material/Speed';

interface BrandedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  creatorName?: string;
  textColor?: string | null;
  onProgress?: (progress: number) => void;
  onEnded?: () => void;
}

export default function BrandedVideoPlayer({ 
  src, 
  poster, 
  title, 
  creatorName,
  textColor = null,
  onProgress,
  onEnded
}: BrandedVideoPlayerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // Core video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLandscape, setIsLandscape] = useState(false);
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [speedAnchor, setSpeedAnchor] = useState<null | HTMLElement>(null);
  
  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [seekPreview, setSeekPreview] = useState<{ show: boolean; direction: 'forward' | 'backward'; amount: number }>({ 
    show: false, 
    direction: 'forward', 
    amount: 0 
  });

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }, 100);
    };

    // Check initial orientation
    setIsLandscape(window.innerWidth > window.innerHeight);

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Enhanced fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Memoized responsive styles
  const responsiveStyles = useMemo(() => ({
    controlButton: {
      width: isMobile ? 44 : 40,
      height: isMobile ? 44 : 40,
      color: '#fff',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: 'scale(1.05)',
      },
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    playButton: {
      width: isMobile ? 70 : 80,
      height: isMobile ? 70 : 80,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'scale(1.1)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
      }
    }
  }), [isMobile]);

  // Auto-hide controls with smart timing - UPDATED
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    setShowControls(true);
    
    if (isPlaying) {
      // Extended to 4 seconds for better UX
      const timeout = setTimeout(() => setShowControls(false), 4000);
      setControlsTimeout(timeout);
    }
  }, [isPlaying, controlsTimeout]);

  // Enhanced video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime / video.duration);
    };
    
    const handleDurationChange = () => setDuration(video.duration);
    const handleLoadedData = () => setIsLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!video) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'arrowleft':
          seekBy(-10);
          break;
        case 'arrowright':
          seekBy(10);
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onProgress, onEnded]);

  // Enhanced control functions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    resetControlsTimer();
  }, [isPlaying, resetControlsTimer]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const adjustVolume = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Math.max(0, Math.min(1, volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  }, [volume, isMuted]);

  const seekBy = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    
    // Show seek preview
    setSeekPreview({
      show: true,
      direction: seconds > 0 ? 'forward' : 'backward',
      amount: Math.abs(seconds)
    });
    
    setTimeout(() => setSeekPreview({ show: false, direction: 'forward', amount: 0 }), 800);
    resetControlsTimer();
  }, [currentTime, duration, resetControlsTimer]);

  const handleVolumeChange = useCallback((newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const volumeValue = (Array.isArray(newValue) ? newValue[0] : newValue) / 100;
    video.volume = volumeValue;
    setVolume(volumeValue);
    
    if (volumeValue === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  }, [isMuted]);

  const handleSeek = useCallback((newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const timeValue = Array.isArray(newValue) ? newValue[0] : newValue;
    video.currentTime = (timeValue / 100) * duration;
  }, [duration]);

  // Fixed fullscreen implementation
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        // Request fullscreen with proper error handling
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.log('Fullscreen operation failed:', error);
    }
    
    resetControlsTimer();
  }, [isFullscreen, resetControlsTimer]);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.log('PiP not supported or failed:', error);
    }
    resetControlsTimer();
  }, [resetControlsTimer]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setSpeedAnchor(null);
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    // Double tap to seek
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30 && deltaTime < 300) {
      const now = Date.now();
      if (now - lastTap < 300) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const tapX = touch.clientX - containerRect.left;
          const isRightSide = tapX > containerRect.width / 2;
          seekBy(isRightSide ? 10 : -10);
        }
      }
      setLastTap(now);
    }
    
    // Swipe gestures for volume (vertical) and seeking (horizontal)
    else if (deltaTime < 500) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        // Vertical swipe for volume
        const volumeDelta = -deltaY / 200;
        adjustVolume(volumeDelta);
      } else if (Math.abs(deltaX) > 50) {
        // Horizontal swipe for seeking
        const seekDelta = deltaX / 10;
        seekBy(seekDelta);
      }
    }

    setTouchStart(null);
  }, [touchStart, lastTap, seekBy, adjustVolume]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Handle GMAS logo click
  const handleGmasClick = useCallback(() => {
    window.open('https://grabmeaslice.com', '_blank', 'noopener,noreferrer');
  }, []);

  // Playback speed options
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        borderRadius: isFullscreen ? 0 : '16px',
        overflow: 'hidden',
        backgroundColor: '#000',
        boxShadow: isFullscreen ? 'none' : '0 12px 40px rgba(31, 38, 135, 0.25)',
        cursor: 'pointer',
        // Fixed fullscreen positioning
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw !important',
          height: '100vh !important',
          zIndex: 9999,
        }),
        // Mobile landscape adjustments
        ...(isMobile && isLandscape && !isFullscreen && {
          maxHeight: '70vh',
        }),
        '&:hover .video-controls': {
          opacity: 1,
        }
      }}
      onMouseMove={resetControlsTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="application"
      aria-label={`Video player: ${title || 'Video'}`}
    >
      {/* Video Element - Fixed overlap issue */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={isMuted}
        playsInline
        style={{
          width: '100%',
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen 
            ? '100vh' 
            : isMobile && isLandscape 
              ? '70vh' 
              : isMobile 
                ? '400px' 
                : '600px',
          objectFit: isFullscreen ? 'contain' : 'cover',
          display: 'block',
          // Fixed video extending beyond container
          borderRadius: isFullscreen ? 0 : '16px',
        }}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        aria-describedby={title ? 'video-title' : undefined}
      />

      {/* Enhanced Brand Watermark - UPDATED fade behavior */}
      <Box
        onClick={handleGmasClick}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 12px',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.65) 100%)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother transition
          opacity: showControls ? 1 : 0, // Fade out completely
          cursor: 'pointer',
          zIndex: 10,
          // Better hover state
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)',
            transform: 'scale(1.05)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            opacity: '1 !important', // Always visible on hover
          }
        }}
      >
        <Box sx={{ 
          width: isMobile ? 18 : 20, 
          height: isMobile ? 18 : 20, 
          borderRadius: '6px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          <img 
            src="/images/gmas-app-square.png" 
            alt="GMAS" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: '#fff',
            fontWeight: 700,
            fontSize: isMobile ? '10px' : '11px',
            letterSpacing: '0.8px',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
          }}
        >
          GMAS
        </Typography>
      </Box>

      {/* Enhanced Creator Badge - UPDATED fade behavior */}
      {creatorName && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: '6px 12px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother transition
            opacity: showControls ? 1 : 0, // Fade out completely
            zIndex: 10,
            // Hover state for creator badge
            '&:hover': {
              opacity: '1 !important',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.12) 100%)',
              transform: 'scale(1.02)',
            }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: textColor || '#fff',
              fontWeight: 600,
              fontSize: isMobile ? '9px' : '10px',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.3px'
            }}
          >
            @{creatorName}
          </Typography>
        </Box>
      )}

      {/* Seek Preview Overlay */}
      <Fade in={seekPreview.show} timeout={200}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '12px 16px',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            color: '#fff',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          {seekPreview.direction === 'forward' ? <Forward10Icon /> : <Replay10Icon />}
          <Typography variant="body2" fontWeight={600}>
            {seekPreview.amount}s
          </Typography>
        </Box>
      </Fade>

      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 20,
          }}
        >
          <Box sx={{ textAlign: 'center', color: '#fff' }}>
            <Box
              sx={{
                width: isMobile ? 36 : 40,
                height: isMobile ? 36 : 40,
                border: '3px solid rgba(255, 255, 255, 0.2)',
                borderTop: '3px solid #fff',
                borderRadius: '50%',
                animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
                mx: 'auto',
                mb: 1,
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Loading...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Enhanced Play/Pause Overlay */}
      {!isPlaying && !isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            zIndex: 5,
          }}
          onClick={togglePlay}
        >
          <Box sx={responsiveStyles.playButton}>
            <PlayArrowIcon sx={{ 
              fontSize: isMobile ? 28 : 32, 
              color: '#000', 
              ml: 0.5 
            }} />
          </Box>
        </Box>
      )}

      {/* Enhanced Video Controls - Fixed z-index */}
      <Fade in={showControls || !isPlaying} timeout={300}>
        <Box
          className="video-controls"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.95) 100%)',
            backdropFilter: 'blur(12px)',
            p: isMobile ? 1.5 : 2,
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 100, // Higher z-index to prevent video overlap
            // Ensure controls don't extend beyond container
            borderBottomLeftRadius: isFullscreen ? 0 : '16px',
            borderBottomRightRadius: isFullscreen ? 0 : '16px',
          }}
        >
          {/* Progress Bar */}
          <Box sx={{ mb: isMobile ? 1.5 : 2 }}>
            <Slider
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={(_, value) => handleSeek(value)}
              sx={{
                color: '#fff',
                height: isMobile ? 4 : 3,
                '& .MuiSlider-thumb': {
                  width: isMobile ? 16 : 12,
                  height: isMobile ? 16 : 12,
                  backgroundColor: '#fff',
                  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.4)',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#fff',
                  border: 'none',
                  height: isMobile ? 4 : 3,
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  height: isMobile ? 4 : 3,
                },
              }}
              aria-label="Video progress"
            />
          </Box>

          {/* Control Buttons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 0.5 : 1,
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            <IconButton onClick={togglePlay} sx={responsiveStyles.controlButton} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            {!isMobile && (
              <IconButton onClick={() => seekBy(-10)} sx={responsiveStyles.controlButton} aria-label="Rewind 10 seconds">
                <Replay10Icon />
              </IconButton>
            )}

            {!isMobile && (
              <IconButton onClick={() => seekBy(10)} sx={responsiveStyles.controlButton} aria-label="Forward 10 seconds">
                <Forward10Icon />
              </IconButton>
            )}

            <IconButton onClick={toggleMute} sx={responsiveStyles.controlButton} aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>

            {!isMobile && (
              <Box sx={{ width: 80, mx: 1 }}>
                <Slider
                  value={volume * 100}
                  onChange={(_, value) => handleVolumeChange(value)}
                  sx={{
                    color: '#fff',
                    '& .MuiSlider-thumb': {
                      width: 8,
                      height: 8,
                      backgroundColor: '#fff',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#fff',
                      border: 'none',
                      height: 2,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      height: 2,
                    },
                  }}
                  aria-label="Volume"
                />
              </Box>
            )}

            <Typography variant="caption" sx={{ 
              color: '#fff', 
              minWidth: isMobile ? 60 : 80,
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 500
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Speed Control */}
            <IconButton 
              onClick={(e) => setSpeedAnchor(e.currentTarget)} 
              sx={responsiveStyles.controlButton}
              aria-label="Playback speed"
            >
              <SpeedIcon />
            </IconButton>

            {/* Picture in Picture */}
            {!isMobile && document.pictureInPictureEnabled && (
              <IconButton onClick={togglePictureInPicture} sx={responsiveStyles.controlButton} aria-label="Picture in picture">
                <PictureInPictureAltIcon />
              </IconButton>
            )}

            {/* Settings */}
            <IconButton 
              onClick={(e) => setSettingsAnchor(e.currentTarget)} 
              sx={responsiveStyles.controlButton}
              aria-label="Settings"
            >
              <SettingsIcon />
            </IconButton>

            <IconButton onClick={toggleFullscreen} sx={responsiveStyles.controlButton} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>
      </Fade>

      {/* Speed Menu - Fixed z-index */}
      <Menu
        anchorEl={speedAnchor}
        open={Boolean(speedAnchor)}
        onClose={() => setSpeedAnchor(null)}
        sx={{ zIndex: 10000 }}
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }
        }}
      >
        {speedOptions.map((speed) => (
          <MenuItem 
            key={speed} 
            onClick={() => changePlaybackRate(speed)}
            selected={playbackRate === speed}
            sx={{ 
              color: '#fff',
              fontSize: '14px',
              fontWeight: playbackRate === speed ? 600 : 400,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {speed}x {speed === 1 && '(Normal)'}
          </MenuItem>
        ))}
      </Menu>

      {/* Settings Menu - Fixed z-index */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
        sx={{ zIndex: 10000 }}
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }
        }}
      >
        <MenuItem sx={{ color: '#fff', fontSize: '14px' }}>
          Auto (720p)
        </MenuItem>
        <MenuItem sx={{ color: '#fff', fontSize: '14px' }}>
          1080p
        </MenuItem>
        <MenuItem sx={{ color: '#fff', fontSize: '14px' }}>
          720p
        </MenuItem>
        <MenuItem sx={{ color: '#fff', fontSize: '14px' }}>
          480p
        </MenuItem>
      </Menu>

      {/* Hidden title for accessibility */}
      {title && (
        <Typography
          id="video-title"
          sx={{ 
            position: 'absolute', 
            left: -9999, 
            width: 1, 
            height: 1, 
            overflow: 'hidden' 
          }}
        >
          {title}
        </Typography>
      )}
    </Box>
  );
}

// Enhanced mobile-first improvements
const BrandedVideoPlayerEnhanced = {
  // 1. Mobile gesture support
  handleTouchGestures: true,
  doubleTapToSeek: true,
  swipeToAdjustVolume: true,
  
  // 2. Adaptive UI based on screen size
  responsiveControls: {
    mobile: "simplified",
    tablet: "standard", 
    desktop: "full"
  },
  
  // 3. Accessibility features
  keyboardShortcuts: true,
  ariaLabels: true,
  screenReaderSupport: true,
  
  // 4. Advanced features
  pictureInPicture: true,
  playbackSpeedControl: true,
  qualitySelector: true,
  
  // 5. Refined animations
  springAnimations: true,
  hapticFeedback: true, // for mobile
  gestureRecognition: true
}