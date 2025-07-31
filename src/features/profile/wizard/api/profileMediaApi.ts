import { axiosInstance } from '@/lib/axios'

const uploadProfileImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await axiosInstance.post('/api/accounts/media/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const deleteProfileImage = async () => {
  const response = await axiosInstance.delete('/api/accounts/media/profile-image')
  return response.data
}

const uploadBackgroundImage = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await axiosInstance.post('/api/accounts/media/background-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const deleteBackgroundImage = async () => {
  const response = await axiosInstance.delete('/api/accounts/media/background-image')
  return response.data
}

// Gallery Media APIs
const uploadGalleryMedia = async (file: File, description?: string, position?: number) => {
  const formData = new FormData()
  formData.append('file', file)
  if (description) formData.append('description', description)
  if (position) formData.append('position', position.toString())
  
  const response = await axiosInstance.post('/api/accounts/media/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const getGalleryMedia = async () => {
  const response = await axiosInstance.get('/api/accounts/media/gallery')
  return response.data
}

const deleteGalleryMedia = async (mediaId: number) => {
  const response = await axiosInstance.delete(`/api/accounts/media/gallery/${mediaId}`)
  return response.data
}

const updateGalleryMediaPosition = async (mediaId: number, position: number) => {
  const response = await axiosInstance.put(`/api/accounts/media/gallery/${mediaId}/position`, {
    position
  })
  return response.data
}

// Banner APIs
const uploadBannerImage = async (file: File) => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await axiosInstance.post('/api/accounts/banner/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const deleteBannerImage = async () => {
  const response = await axiosInstance.delete('/api/accounts/banner/image')
  return response.data
}

const getBannerDetails = async () => {
  const response = await axiosInstance.get('/api/accounts/banner/details')
  return response.data
}

const updateBannerDetails = async (bannerData: {
  banner_title?: string
  banner_color?: string
  banner_button_text?: string
  banner_button_link?: string
}) => {
  const response = await axiosInstance.put('/api/accounts/banner/details', bannerData)
  return response.data
}

// Links APIs
const getAllLinks = async () => {
  const response = await axiosInstance.get('/api/accounts/links')
  return response.data
}

const createLink = async (linkData: {
  title: string
  url: string
  color?: string
  image?: File
}) => {
  const formData = new FormData()
  formData.append('title', linkData.title)
  formData.append('url', linkData.url)
  if (linkData.color) formData.append('color', linkData.color)
  if (linkData.image) formData.append('image', linkData.image)
  
  const response = await axiosInstance.post('/api/accounts/links', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const updateLink = async (position: number, linkData: {
  title?: string
  url?: string
  color?: string
  image?: File
  delete_image?: boolean
}) => {
  const formData = new FormData()
  if (linkData.title) formData.append('title', linkData.title)
  if (linkData.url) formData.append('url', linkData.url)
  if (linkData.color) formData.append('color', linkData.color)
  if (linkData.image) formData.append('image', linkData.image)
  if (linkData.delete_image) formData.append('delete_image', 'true')
  
  const response = await axiosInstance.put(`/api/accounts/links/${position}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

const deleteLink = async (position: number) => {
  const response = await axiosInstance.delete(`/api/accounts/links/${position}`)
  return response.data
}

const moveLinkPosition = async (currentPosition: number, newPosition: number) => {
  const response = await axiosInstance.put(`/api/accounts/links/${currentPosition}/move/${newPosition}`)
  return response.data
}

const getSectionTitle = async () => {
  const response = await axiosInstance.get('/api/accounts/links/section-title')
  return response.data
}

const updateSectionTitle = async (title: string) => {
  const response = await axiosInstance.put('/api/accounts/links/section-title', { title })
  return response.data
}

export const profileMediaApi = {
  uploadProfileImage,
  deleteProfileImage,
  uploadBackgroundImage,
  deleteBackgroundImage,
  uploadGalleryMedia,
  getGalleryMedia,
  deleteGalleryMedia,
  updateGalleryMediaPosition,
  uploadBannerImage,
  deleteBannerImage,
  getBannerDetails,
  updateBannerDetails,
  getAllLinks,
  createLink,
  updateLink,
  deleteLink,
  moveLinkPosition,
  getSectionTitle,
  updateSectionTitle,
}
