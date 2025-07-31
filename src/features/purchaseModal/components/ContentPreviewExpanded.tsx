import React from 'react';
import { 
  Dialog, 
  DialogContent,
  Box, 
  IconButton,
  Typography,
  Fade,
  Backdrop
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ContentPreviewExpandedProps {
  content: any;
  open: boolean;
  onClose: () => void;
  textColor?: string;
  uiBackgroundColor?: string;
  uiBorderColor?: string;
}

export default function ContentPreviewExpanded({
  content,
  open,
  onClose,
  textColor,
  uiBackgroundColor,
  uiBorderColor,
}: ContentPreviewExpandedProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }
      }}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'relative',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 600,
            }}
          >
            {content.title}
          </Typography>
          
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <img
            src={content.cover_image_url}
            alt={content.title}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}