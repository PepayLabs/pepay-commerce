import React, { useState, useEffect } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react'
import { profileMediaApi } from '../../api/profileMediaApi'
import { toast } from 'sonner'

interface GalleryItem {
  media_id: number
  media_url: string
  media_type: 'photo' | 'video'
  description?: string
  position: number
}

export default function GalleryStep() {
  const { state, actions } = useWizard()
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load gallery items on mount
  useEffect(() => {
    loadGalleryItems()
  }, [])

  const loadGalleryItems = async () => {
    try {
      const items = await profileMediaApi.getGalleryMedia()
      const sortedItems = items.sort((a: GalleryItem, b: GalleryItem) => a.position - b.position)
      setGalleryItems(sortedItems)
      
      // Update wizard state with gallery data
      const mediaData = sortedItems.map((item: GalleryItem) => ({
        id: item.media_id,
        signed_url: item.media_url,
        description: item.description || '',
        media_type: item.media_type,
        position: item.position
      }))
      
      actions.updateFormData({ media: mediaData })
      
    } catch (error) {
      console.error('Failed to load gallery:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check gallery limit
    if (galleryItems.length >= 5) {
      toast.error('Gallery is full! Maximum 5 items allowed.')
      return
    }

    // Validate file type - only images and GIFs for videos
    if (file.type.startsWith('image/')) {
      // All image types allowed
    } else if (file.type === 'image/gif') {
      // GIF allowed
    } else {
      toast.error('Only images and GIF files are allowed')
      return
    }

    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File size must be less than 8MB')
      return
    }

    setIsUploading(true)
    
    try {
      const nextPosition = galleryItems.length + 1
      const response = await profileMediaApi.uploadGalleryMedia(file, '', nextPosition)
      
      await loadGalleryItems() // Reload and update wizard state
      toast.success('Media uploaded successfully!')
      
    } catch (error: any) {
      console.error('❌ Failed to upload media:', error)
      toast.error(error.response?.data?.error || 'Failed to upload media')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleDelete = async (mediaId: number) => {
    try {
      await profileMediaApi.deleteGalleryMedia(mediaId)
      await loadGalleryItems() // Reload and update wizard state
      toast.success('Media deleted successfully!')
    } catch (error: any) {
      console.error('❌ Failed to delete media:', error)
      toast.error('Failed to delete media')
    }
  }

  const handlePositionChange = async (mediaId: number, newPosition: number) => {
    try {
      await profileMediaApi.updateGalleryMediaPosition(mediaId, newPosition)
      await loadGalleryItems() // Reload and update wizard state
      toast.success('Position updated!')
    } catch (error: any) {
      console.error('❌ Failed to update position:', error)
      toast.error('Failed to update position')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Media Gallery
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add up to 5 photos or GIFs to showcase your work. You can reorder them by changing positions.
        </p>
      </div>

      {/* Current Gallery Items */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {galleryItems.map((item, index) => (
            <div
              key={item.media_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center space-x-4"
            >
              {/* Drag Handle */}
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />

              {/* Preview */}
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.media_url}
                  alt={item.description || `Gallery item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Position Controls */}
              <div className="flex flex-col space-y-1">
                <Label className="text-xs text-gray-500">Position</Label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].slice(0, galleryItems.length).map((pos) => (
                    <Button
                      key={pos}
                      variant={item.position === pos ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePositionChange(item.media_id, pos)}
                      className="w-8 h-8 text-xs"
                    >
                      {pos}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Position & Info */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Position {item.position}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {item.media_type}
                </p>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(item.media_id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {galleryItems.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No media in gallery</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Section */}
      {galleryItems.length < 5 && (
        <div className="space-y-4">
          <Label className="text-gray-800 dark:text-gray-200 font-medium">
            Add Media ({galleryItems.length}/5)
          </Label>
          
          <div className="flex justify-center">
            <div className="relative">
              <input
                type="file"
                accept="image/*,.gif"
                onChange={handleFileUpload}
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
                    Upload Media
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Images and GIFs only
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              Preferred size: 1080x1080px (square format)
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              Maximum file size: 8MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
