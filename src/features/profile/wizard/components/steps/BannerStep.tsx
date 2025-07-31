import React, { useState } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Trash2, Image as ImageIcon, Palette } from 'lucide-react'
import { profileMediaApi } from '../../api/profileMediaApi'
import { toast } from 'sonner'

export default function BannerStep() {
  const { state, actions } = useWizard()
  const { account } = state.formData
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const hasBannerImage = account.banner_image_signed_url && account.banner_image_signed_url.trim() !== ''

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size must be less than 8MB')
      return
    }

    setIsUploading(true)
    
    try {
      const response = await profileMediaApi.uploadBannerImage(file)
      
      actions.updateAccountData({ 
        banner_image_signed_url: response.signed_image_url || response.image_url
      })
      
      toast.success('Banner image uploaded successfully!')
      
    } catch (error: any) {
      console.error('❌ Failed to upload banner image:', error)
      toast.error(error.response?.data?.error || 'Failed to upload banner image')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteImage = async () => {
    setIsDeleting(true)
    
    try {
      await profileMediaApi.deleteBannerImage()
      
      actions.updateAccountData({ 
        banner_image_signed_url: ''
      })
      
      toast.success('Banner image removed!')
      
    } catch (error: any) {
      console.error('❌ Failed to delete banner image:', error)
      toast.error('Failed to remove banner image')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveBannerDetails = async () => {
    setIsSaving(true)
    
    try {
      const bannerData = {
        banner_title: account.banner_title || '',
        banner_color: account.banner_color || '',
        banner_button_text: account.banner_button_text || '',
        banner_button_link: account.banner_button_link || '',
      }
      
      await profileMediaApi.updateBannerDetails(bannerData)
      toast.success('Banner details saved!')
      
    } catch (error: any) {
      console.error('❌ Failed to save banner details:', error)
      toast.error(error.response?.data?.error || 'Failed to save banner details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    actions.updateAccountData({ [field]: value })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Banner</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add a banner to highlight important information or calls-to-action
        </p>
      </div>

      {/* Banner Image Section */}
      <div className="space-y-4">
        <Label className="text-gray-800 dark:text-gray-200 font-medium">
          Banner Image (Optional)
        </Label>
        
        {hasBannerImage ? (
          <div className="relative">
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img
                src={account.banner_image_signed_url}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Banner image failed to load:', account.banner_image_signed_url)
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
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button
                variant="outline"
                disabled={isUploading}
                className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Banner Image
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center space-y-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Recommended size: 1200×300px (4:1 ratio)
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs">
            Maximum file size: 8MB
          </p>
        </div>
      </div>

      {/* Banner Details */}
      <div className="space-y-6">
        <Label className="text-gray-800 dark:text-gray-200 font-medium">
          Banner Details
        </Label>
        
        {/* Banner Title */}
        <div className="space-y-2">
          <Label htmlFor="banner-title" className="text-sm text-gray-700 dark:text-gray-300">
            Banner Title
          </Label>
          <Input
            id="banner-title"
            type="text"
            placeholder="Featured Content"
            value={account.banner_title || ''}
            onChange={(e) => handleInputChange('banner_title', e.target.value)}
            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* Banner Color */}
        <div className="space-y-2">
          <Label htmlFor="banner-color" className="text-sm text-gray-700 dark:text-gray-300">
            Banner Background Color
          </Label>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                id="banner-color"
                type="color"
                value={account.banner_color || '#667eea'}
                onChange={(e) => handleInputChange('banner_color', e.target.value)}
                className="w-12 h-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer"
              />
              <Palette className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white" />
            </div>
            <Input
              type="text"
              placeholder="#667eea"
              value={account.banner_color || ''}
              onChange={(e) => handleInputChange('banner_color', e.target.value)}
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Button Text */}
        <div className="space-y-2">
          <Label htmlFor="button-text" className="text-sm text-gray-700 dark:text-gray-300">
            Button Text (Optional)
          </Label>
          <Input
            id="button-text"
            type="text"
            placeholder="Learn More"
            value={account.banner_button_text || ''}
            onChange={(e) => handleInputChange('banner_button_text', e.target.value)}
            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* Button Link */}
        <div className="space-y-2">
          <Label htmlFor="button-link" className="text-sm text-gray-700 dark:text-gray-300">
            Button Link (Optional)
          </Label>
          <Input
            id="button-link"
            type="url"
            placeholder="https://example.com"
            value={account.banner_button_link || ''}
            onChange={(e) => handleInputChange('banner_button_link', e.target.value)}
            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveBannerDetails}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            'Save Banner Details'
          )}
        </Button>
      </div>
    </div>
  )
}