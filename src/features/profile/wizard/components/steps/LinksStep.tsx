import React, { useState, useEffect } from 'react'
import { useWizard } from '../../context/WizardProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, GripVertical, Plus, Edit3, Save, X, ChevronUp, ChevronDown } from 'lucide-react'
import { profileMediaApi } from '../../api/profileMediaApi'
import { toast } from 'sonner'

interface LinkItem {
  link_id: number
  position: number
  title: string
  url: string
  color?: string
  image_url?: string
  signed_image_url?: string
}

export default function LinksStep() {
  const { state, actions } = useWizard()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [sectionTitle, setSectionTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingLink, setEditingLink] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    color: '#667eea',
    image: null as File | null
  })
  const [editLink, setEditLink] = useState({
    title: '',
    url: '',
    color: '',
    image: null as File | null,
    deleteImage: false
  })

  useEffect(() => {
    loadLinksData()
  }, [])

  const loadLinksData = async () => {
    try {
      setIsLoading(true)
      const response = await profileMediaApi.getAllLinks()
      
      const sortedLinks = response.links?.sort((a: LinkItem, b: LinkItem) => a.position - b.position) || []
      setLinks(sortedLinks)
      setSectionTitle(response.section_title || 'FEATURED')
      
      // Update wizard state
      actions.updateFormData({ 
        links: sortedLinks.map((link: LinkItem) => ({
          link_id: link.link_id,
          position: link.position,
          title: link.title,
          url: link.url,
          color: link.color,
          signed_image_url: link.signed_image_url
        }))
      })
      actions.updateAccountData({ link_section_title: response.section_title || 'FEATURED' })
      
    } catch (error) {
      console.error('Failed to load links:', error)
      toast.error('Failed to load links')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSectionTitleUpdate = async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      await profileMediaApi.updateSectionTitle(sectionTitle)
      actions.updateAccountData({ link_section_title: sectionTitle })
      toast.success('Section title updated!')
    } catch (error: any) {
      console.error('Failed to update section title:', error)
      toast.error('Failed to update section title')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error('Title and URL are required')
      return
    }

    if (links.length >= 5) {
      toast.error('Maximum 5 links allowed')
      return
    }

    try {
      const linkData = {
        title: newLink.title.trim(),
        url: newLink.url.trim(),
        color: newLink.image ? undefined : newLink.color,
        image: newLink.image || undefined
      }

      await profileMediaApi.createLink(linkData)
      await loadLinksData()
      
      setNewLink({ title: '', url: '', color: '#667eea', image: null })
      setShowAddForm(false)
      toast.success('Link added successfully!')
    } catch (error: any) {
      console.error('Failed to add link:', error)
      toast.error(error.response?.data?.error || 'Failed to add link')
    }
  }

  const handleUpdateLink = async (position: number) => {
    if (!editLink.title.trim() || !editLink.url.trim()) {
      toast.error('Title and URL are required')
      return
    }

    try {
      const linkData = {
        title: editLink.title.trim(),
        url: editLink.url.trim(),
        color: editLink.image || editLink.deleteImage ? undefined : editLink.color,
        image: editLink.image || undefined,
        delete_image: editLink.deleteImage
      }

      await profileMediaApi.updateLink(position, linkData)
      await loadLinksData()
      
      setEditingLink(null)
      setEditLink({ title: '', url: '', color: '', image: null, deleteImage: false })
      toast.success('Link updated successfully!')
    } catch (error: any) {
      console.error('Failed to update link:', error)
      toast.error(error.response?.data?.error || 'Failed to update link')
    }
  }

  const handleDeleteLink = async (position: number) => {
    try {
      await profileMediaApi.deleteLink(position)
      await loadLinksData()
      toast.success('Link deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete link:', error)
      toast.error('Failed to delete link')
    }
  }

  const handleMoveLink = async (currentPosition: number, direction: 'up' | 'down') => {
    const currentIndex = links.findIndex(link => link.position === currentPosition)
    const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1
    
    if (newPosition < 1 || newPosition > links.length) return

    try {
      await profileMediaApi.moveLinkPosition(currentPosition, newPosition)
      await loadLinksData()
    } catch (error: any) {
      console.error('Failed to move link:', error)
      toast.error('Failed to reorder link')
    }
  }

  const startEdit = (link: LinkItem) => {
    setEditingLink(link.position)
    setEditLink({
      title: link.title,
      url: link.url,
      color: link.color || '#667eea',
      image: null,
      deleteImage: false
    })
  }

  const cancelEdit = () => {
    setEditingLink(null)
    setEditLink({ title: '', url: '', color: '', image: null, deleteImage: false })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Featured Links
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add up to 5 featured links with custom images and colors
        </p>
      </div>

      {/* Section Title */}
      <div className="space-y-3">
        <Label className="text-gray-800 dark:text-gray-200 font-medium">
          Section Title
        </Label>
        <div className="flex gap-2">
          <Input
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="FEATURED"
            maxLength={30}
            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
          />
          <Button
            onClick={handleSectionTitleUpdate}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Existing Links */}
      {links.length > 0 && (
        <div className="space-y-4">
          <Label className="text-gray-800 dark:text-gray-200 font-medium">
            Your Links ({links.length}/5)
          </Label>
          
          {links.map((link, index) => (
            <div 
              key={link.link_id}
              className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              {editingLink === link.position ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-sm text-gray-700 dark:text-gray-300">Title</Label>
                      <Input
                        value={editLink.title}
                        onChange={(e) => setEditLink(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Link title"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-700 dark:text-gray-300">URL</Label>
                      <Input
                        value={editLink.url}
                        onChange={(e) => setEditLink(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        type="url"
                        className="mt-1"
                      />
                    </div>
                    {!link.signed_image_url && !editLink.image && (
                      <div>
                        <Label className="text-sm text-gray-700 dark:text-gray-300">Color</Label>
                        <Input
                          value={editLink.color}
                          onChange={(e) => setEditLink(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#667eea"
                          type="color"
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-gray-700 dark:text-gray-300">Image (Optional)</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditLink(prev => ({ 
                          ...prev, 
                          image: e.target.files?.[0] || null 
                        }))}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {link.signed_image_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <img src={link.signed_image_url} alt="Current" className="w-10 h-10 rounded object-cover" />
                          <Button
                            onClick={() => setEditLink(prev => ({ ...prev, deleteImage: !prev.deleteImage }))}
                            variant="outline"
                            size="sm"
                            className={editLink.deleteImage ? 'bg-red-100 text-red-700' : ''}
                          >
                            {editLink.deleteImage ? 'Keep Image' : 'Remove Image'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateLink(link.position)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                      <Button
                        onClick={() => handleMoveLink(link.position, 'up')}
                        disabled={index === 0}
                        variant="ghost"
                        size="sm"
                        className="h-4 p-0"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleMoveLink(link.position, 'down')}
                        disabled={index === links.length - 1}
                        variant="ghost"
                        size="sm"
                        className="h-4 p-0"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {link.signed_image_url && (
                      <img 
                        src={link.signed_image_url} 
                        alt={link.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    {!link.signed_image_url && link.color && (
                      <div 
                        className="w-10 h-10 rounded"
                        style={{ backgroundColor: link.color }}
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {link.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {link.url}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEdit(link)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteLink(link.position)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Link */}
      {links.length < 5 && (
        <div className="space-y-4">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="w-full bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Link
            </Button>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300">Title *</Label>
                  <Input
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="My Website"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300">URL *</Label>
                  <Input
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    type="url"
                    className="mt-1"
                  />
                </div>
                {!newLink.image && (
                  <div>
                    <Label className="text-sm text-gray-700 dark:text-gray-300">Color</Label>
                    <Input
                      value={newLink.color}
                      onChange={(e) => setNewLink(prev => ({ ...prev, color: e.target.value }))}
                      type="color"
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300">Image (Optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewLink(prev => ({ 
                      ...prev, 
                      image: e.target.files?.[0] || null 
                    }))}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Images will override the color setting
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Link
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewLink({ title: '', url: '', color: '#667eea', image: null })
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No links yet. Add your first featured link!</p>
        </div>
      )}
    </div>
  )
}