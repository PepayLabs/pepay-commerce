import React, { useState } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { profileMediaApi } from '../../../api/profileMediaApi'
import { toast } from 'sonner'

export default function BackgroundImageStep() {
  const { state, actions } = useWizard()
  const { account } = state.formData
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setIsUploading(true)
    
    try {
      console.log('📤 Uploading background image:', file.name)
      const response = await profileMediaApi.uploadBackgroundImage(file)
      
      // Update the form data with the new background image URL
      actions.updateAccountData({ 
        background_image_signed_url: response.background_image_url || response.background_image_signed_url
      })
      
      toast.success('Background image uploaded successfully!')
      console.log('✅ Background image uploaded:', response)
      
    } catch (error: any) {
      console.error('❌ Failed to upload background image:', error)
      toast.error(error.response?.data?.error || 'Failed to upload background image')
    } finally {
      setIsUploading(false)
      // Clear the input value so the same file can be selected again
      event.target.value = ''
    }
  }

  const handleDeleteImage = async () => {
    if (!account.background_image_signed_url) return

    setIsDeleting(true)
    
    try {
      console.log('🗑️ Deleting background image')
      await profileMediaApi.deleteBackgroundImage()
      
      // Clear the background image from form data
      actions.updateAccountData({ background_image_signed_url: '' })
      
      toast.success('Background image removed successfully!')
      console.log('✅ Background image deleted')
      
    } catch (error: any) {
      console.error('❌ Failed to delete background image:', error)
      toast.error(error.response?.data?.error || 'Failed to remove background image')
    } finally {
      setIsDeleting(false)
    }
  }

  const hasBackgroundImage = account.background_image_signed_url && account.background_image_signed_url.trim() !== ''

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Background Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add a custom background image to personalize your profile and select a text color for optimal readability
        </p>
      </div>

      {/* Current Background Image */}
      {hasBackgroundImage && (
        <div className="space-y-4">
          <Label className="text-gray-800 dark:text-gray-200 font-medium">Current Background</Label>
          <div className="relative">
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img
                src={account.background_image_signed_url}
                alt="Background"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Background image failed to load:', account.background_image_signed_url)
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteImage}
              disabled={isDeleting}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="space-y-4">
        <Label className="text-gray-800 dark:text-gray-200 font-medium">
          {hasBackgroundImage ? 'Replace Background Image' : 'Upload Background Image'}
        </Label>
        
        <div className="flex flex-col items-center space-y-4">
          {!hasBackgroundImage && (
            <div className="w-full h-48 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="text-center space-y-2">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No background image uploaded</p>
              </div>
            </div>
          )}
          
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="background-upload"
            />
            <Button
              variant="outline"
              disabled={isUploading}
              className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {hasBackgroundImage ? 'Replace Image' : 'Upload Image'}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Recommended: 1920x1080px or larger
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs">
            Maximum file size: 10MB. Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>

      {/* Text Color Picker */}
      <div className="space-y-4">
        <Label className="text-gray-800 dark:text-gray-200 font-medium">
          Text Color
        </Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={account.background_text_color || '#ffffff'}
            onChange={(e) => actions.updateAccountData({ 
              background_text_color: e.target.value 
            })}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Choose text color for optimal readability
          </span>
        </div>
      </div>

      {/* Optional Helper Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          💡 <strong>Tip:</strong> Your background image will be displayed behind your profile content. 
          Choose an image that won't interfere with text readability.
        </p>
      </div>
    </div>
  )
}