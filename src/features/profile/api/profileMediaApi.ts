import { axiosInstance } from '@/lib/axios'

export const profileMediaApi = {
  uploadProfileImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post('/api/accounts/media/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteProfileImage: async () => {
    const response = await axiosInstance.delete('/api/accounts/media/profile-image')
    return response.data
  },

  uploadBackgroundImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axiosInstance.post('/api/accounts/media/background-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteBackgroundImage: async () => {
    const response = await axiosInstance.delete('/api/accounts/media/background-image')
    return response.data
  },
} 