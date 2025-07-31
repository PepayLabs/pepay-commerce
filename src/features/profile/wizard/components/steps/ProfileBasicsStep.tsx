import React, { useState, useRef } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  PhotoCamera,
  Person,
  CloudUpload,
  Delete,
} from '@mui/icons-material'
import { useWizard } from '../../context/WizardProvider'

interface ImageCropDialogProps {
  open: boolean
  image: string
  onClose: () => void
  onSave: (croppedBlob: Blob) => void
}

function ImageCropDialog({ open, image, onClose, onSave }: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
    aspect: 1,
  })
  
  const imageRef = useRef<HTMLImageElement | null>(null)

  const onCropComplete = (crop: Crop) => {
    console.log('🎯 Crop complete called:', { crop, imageRef: !!imageRef.current })
    
    if (imageRef.current && crop.width && crop.height) {
      const canvas = document.createElement('canvas')
      const image = imageRef.current
      
      // Calculate crop dimensions based on the unit type
      let cropX, cropY, cropWidth, cropHeight
      
      if (crop.unit === '%') {
        // Percentage-based crop
        cropX = (crop.x / 100) * image.naturalWidth
        cropY = (crop.y / 100) * image.naturalHeight  
        cropWidth = (crop.width / 100) * image.naturalWidth
        cropHeight = (crop.height / 100) * image.naturalHeight
      } else {
        // Pixel-based crop - convert from display size to natural size
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        
        cropX = crop.x * scaleX
        cropY = crop.y * scaleY
        cropWidth = crop.width * scaleX
        cropHeight = crop.height * scaleY
      }
      
      console.log('��️ Crop calculations:', { 
        crop,
        naturalSize: { width: image.naturalWidth, height: image.naturalHeight },
        displaySize: { width: image.width, height: image.height },
        scaleFactors: crop.unit === 'px' ? { 
          scaleX: image.naturalWidth / image.width, 
          scaleY: image.naturalHeight / image.height 
        } : 'percentage mode',
        finalCrop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight }
      })
      
      // Set canvas to the crop size
      canvas.width = cropWidth
      canvas.height = cropHeight
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Draw the cropped portion
        ctx.drawImage(
          image,
          cropX,        // source x
          cropY,        // source y  
          cropWidth,    // source width
          cropHeight,   // source height
          0,            // destination x
          0,            // destination y
          cropWidth,    // destination width
          cropHeight    // destination height
        )

        canvas.toBlob((blob) => {
          console.log('✅ Blob created:', { 
            blobExists: !!blob,
            canvasSize: { width: canvas.width, height: canvas.height }
          })
          if (blob) onSave(blob)
        }, 'image/jpeg', 0.95)
      }
    } else {
      console.log('❌ Missing requirements:', { 
        hasImageRef: !!imageRef.current, 
        cropWidth: crop.width, 
        cropHeight: crop.height 
      })
    }
  }

  if (!open) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          minWidth: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px 0' }}>Crop Image</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            aspect={1}
            circularCrop={false}
          >
            <img 
              ref={imageRef}
              src={image} 
              alt="Crop me" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '400px',
                display: 'block'
              }}
              onLoad={() => {
                console.log('🖼️ Image loaded:', { 
                  natural: { width: imageRef.current?.naturalWidth, height: imageRef.current?.naturalHeight },
                  display: { width: imageRef.current?.width, height: imageRef.current?.height }
                })
              }}
            />
          </ReactCrop>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              console.log('❌ Cancel clicked')
              onClose()
            }}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              console.log('💾 Save clicked:', { crop, imageRef: !!imageRef.current })
              e.preventDefault()
              e.stopPropagation()
              onCropComplete(crop)
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfileBasicsStep() {
  const { state, actions } = useWizard()
  const { formData, uploadProgress, errors } = state
  const { account } = formData
  const [dragOver, setDragOver] = useState(false)
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  console.log('🔍 Current account state:', {
    display_name: account.display_name,
    display_link: account.display_link,
    short_bio: account.short_bio,
    bio: account.bio,
    profile_image_signed_url: account.profile_image_signed_url,
  })

  const handleInputChange = (field: keyof typeof account) => (event: React.ChangeEvent<HTMLInputElement>) => {
    actions.updateAccountData({ [field]: event.target.value })
  }

  const handleImageUpload = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedImage(imageUrl)
      setShowCropDialog(true)
    }
  }

  const handleCroppedImageSave = async (croppedBlob: Blob) => {
    try {
      const croppedFile = new File([croppedBlob], 'cropped-profile-image.jpg', {
        type: 'image/jpeg'
      })
      
      await actions.uploadImage('profile_image', croppedFile)
      setShowCropDialog(false)
      setSelectedImage('')
      
      URL.revokeObjectURL(selectedImage)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleCropDialogClose = () => {
    setShowCropDialog(false)
    URL.revokeObjectURL(selectedImage)
    setSelectedImage('')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleRemoveImage = async () => {
    try {
      await actions.deleteImage('profile_image')
      console.log('✅ Profile image deleted successfully')
    } catch (error) {
      console.error('❌ Failed to delete profile image:', error)
    }
  }

  const handleImageDelete = async () => {
    try {
      await actions.deleteImage('profile_image')
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const isUploading = uploadProgress['profile_image'] > 0 && uploadProgress['profile_image'] < 100

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Basics
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Let's start with the essential information for your profile.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Profile Picture Upload */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Profile Picture
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={account.profile_image_signed_url}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
                imgProps={{
                  onError: (e) => {
                    console.log('❌ Avatar image failed to load:', account.profile_image_signed_url)
                    e.currentTarget.style.display = 'none'
                  },
                  onLoad: () => {
                    console.log('✅ Avatar image loaded successfully')
                  }
                }}
              >
                {account.display_name ? account.display_name[0]?.toUpperCase() : <Person />}
              </Avatar>
              
              {account.profile_image_signed_url && (
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Paper
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  p: 3,
                  border: `2px dashed ${dragOver ? 'primary.main' : 'grey.300'}`,
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: dragOver ? 'primary.50' : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  },
                }}
                onClick={() => document.getElementById('profile-image-input')?.click()}
              >
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                {isUploading ? (
                  <Box>
                    <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Uploading... {Math.round(uploadProgress['profile_image'] || 0)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress['profile_image'] || 0}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ) : (
                  <Box>
                    <PhotoCamera sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Drop an image here or click to upload
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      JPG, PNG up to 5MB
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Username (display_link) */}
        <TextField
          label="Username"
          placeholder="yourusername"
          value={account.display_link || ''}
          onChange={handleInputChange('display_link')}
          error={!!errors.display_link}
          helperText={errors.display_link || 'Your unique username for your profile URL (grabmeaslice.com/i/yourusername)'}
          fullWidth
          required
          inputProps={{ maxLength: 30 }}
          InputProps={{
            startAdornment: <Typography sx={{ color: 'text.secondary', mr: 0.5 }}>grabmeaslice.com/i/</Typography>
          }}
        />

        {/* Name (display_name) */}
        <TextField
          label="Name"
          placeholder="Your name or brand"
          value={account.display_name || ''}
          onChange={handleInputChange('display_name')}
          error={!!errors.display_name}
          helperText={errors.display_name || 'This is how people will see your name'}
          fullWidth
          required
          inputProps={{ maxLength: 50 }}
        />

        {/* Short Bio (short_bio) */}
        <TextField
          label="Short Bio"
          placeholder="Creator, Artist, Maker..."
          value={account.short_bio || ''}
          onChange={handleInputChange('short_bio')}
          error={!!errors.short_bio}
          helperText={errors.short_bio || 'A brief description that appears under your name'}
          fullWidth
          inputProps={{ maxLength: 100 }}
        />

        {/* Bio (bio) */}
        <TextField
          label="About You"
          placeholder="Tell your story, what you create, what drives you..."
          value={account.bio || ''}
          onChange={handleInputChange('bio')}
          error={!!errors.bio}
          helperText={errors.bio || 'Share more about yourself and what you do'}
          multiline
          rows={4}
          fullWidth
          inputProps={{ maxLength: 500 }}
        />

        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: 'right', 
            color: (account.bio?.length || 0) > 450 ? 'warning.main' : 'text.secondary',
            mt: -2
          }}
        >
          {account.bio?.length || 0}/500 characters
        </Typography>
      </Box>

      {/* Helpful Tips */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Pro tip:</strong> A complete profile gets 3x more engagement! 
          Make sure to upload a clear profile picture and write a compelling bio that tells your story.
        </Typography>
      </Alert>

      {/* Add the ImageCropDialog */}
      <ImageCropDialog
        open={showCropDialog}
        image={selectedImage}
        onClose={handleCropDialogClose}
        onSave={handleCroppedImageSave}
      />

    </Box>
  )
} 