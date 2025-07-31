import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { WizardState, WizardActions, WizardFormData, WizardStep, WizardGoal } from '../types/wizard.types'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'
import ProfileBasicsStep from '../components/steps/ProfileBasicsStep'
import { profileMediaApi } from '../../api/profileMediaApi'
import { axiosInstance } from '@/lib/axios'
import SocialLinksStep from '../components/steps/SocialLinksStep'
import SupportStep from '../components/steps/SupportStep'
import BackgroundImageStep from '../components/steps/BackgroundImageStep'
import GalleryStep from '../components/steps/GalleryStep'
import BannerStep from '../components/steps/BannerStep'
import LinksStep from '../components/steps/LinksStep'
import WalletsStep from '../components/steps/WalletsStep'
import GoalsStep from '../components/steps/GoalsStep'

interface WizardContextType {
  state: WizardState
  actions: WizardActions
  steps: WizardStep[]
}

const WizardContext = createContext<WizardContextType | null>(null)

type WizardAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<WizardFormData> }
  | { type: 'UPDATE_ACCOUNT_DATA'; payload: Partial<WizardFormData['account']> }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: { field: string; progress: number } }
  | { type: 'LOAD_PROFILE_DATA'; payload: WizardFormData }
  | { type: 'RESET_WIZARD' }
  | { type: 'SET_ERROR'; payload: { field: string; error: string } }

const initialFormData: WizardFormData = {
  account: {
    display_name: '',
    display_link: '',
    bio: '',
    short_bio: '',
    website_url: '',
    instagram_url: '',
    twitter_url: '',
    tiktok_url: '',
    farcaster_url: '',
    youtube_url: '',
    blog_url: '',
    stream_url: '',
    telegram_url: '',
    discord_url: '',
    link_section_title: 'FEATURED',
    background_color: '',
    banner_title: '',
    banner_color: '',
    banner_button_text: '',
    banner_button_link: '',
    account_type: 'creator',
    npo_mission: '',
    
    // New payment model structure with defaults
    payment_model: 'donations',
    donation_amounts: {
      amount_1: 5,
      amount_2: 10,
      amount_3: 25
    },
    subscription_pricing: {
      monthly_price: 10,
      quarterly_price: 27,
      yearly_price: 80
    },
    
    // Legacy fields (for backwards compatibility)
    custom_donation_amount_1: 5,
    custom_donation_amount_2: 10,
    custom_donation_amount_3: 25,
    
    support_image: 1,
    support_message: 'Help me continue creating content',
    support_title: 'Support My Work',
    profile_image_signed_url: '',
    background_image_signed_url: '',
    banner_image_signed_url: '',
    background_text_color: '#ffffff',
  },
  media: [],
  links: [],
}

const initialState: WizardState = {
  currentStep: 0,
  totalSteps: 9,
  formData: initialFormData,
  isPreviewMode: true,
  isDirty: false,
  errors: {},
  isLoading: true,
  isSaving: false,
  uploadProgress: {},
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload }
    
    case 'UPDATE_FORM_DATA':
      return { 
        ...state, 
        formData: { ...state.formData, ...action.payload },
        isDirty: true 
      }
    
    case 'UPDATE_ACCOUNT_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          account: { ...state.formData.account, ...action.payload }
        },
        isDirty: true
      }
    
    case 'SET_PREVIEW_MODE':
      return { ...state, isPreviewMode: action.payload }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload }
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    
    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: {
          ...state.uploadProgress,
          [action.payload.field]: action.payload.progress
        }
      }
    
    case 'LOAD_PROFILE_DATA':
      return {
        ...state,
        formData: action.payload,
        isLoading: false
      }
    
    case 'RESET_WIZARD':
      return { ...initialState, isLoading: false }
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.error
        }
      }
    
    default:
      return state
  }
}

interface WizardProviderProps {
  children: React.ReactNode
  initialData?: WizardFormData
  onComplete?: () => void
}

export const WizardProvider: React.FC<WizardProviderProps> = ({ children, initialData, onComplete }) => {
  const [state, dispatch] = useReducer(wizardReducer, {
    ...initialState,
    formData: initialData || initialFormData,
    isLoading: !initialData,
  })

  // Move steps array definition BEFORE actions object
  const steps: WizardStep[] = [
    {
      id: 'profile-basics',
      title: 'Profile Basics',
      description: 'Display name, bio, profile picture, and basic information',
      component: ProfileBasicsStep,
    },
    {
      id: 'social-links',
      title: 'Social Links',
      description: 'Connect your social media accounts and website',
      component: SocialLinksStep,
    },
    {
      id: 'support-settings',
      title: 'Support Settings',
      description: 'Configure donation amounts and support messaging',
      component: SupportStep,
    },
    {
      id: 'background-image',
      title: 'Background Settings',
      description: 'Upload a background image for your profile and select a text color for optimal readability',
      component: BackgroundImageStep,
    },
    {
      id: 'goals',
      title: 'Goals',
      description: 'Set fundraising or monthly support goals to engage your community',
      component: GoalsStep,
    },
    {
      id: 'gallery',
      title: 'Media Gallery',
      description: 'Add photos and GIFs to showcase your work',
      component: GalleryStep,
    },
    {
      id: 'banner',
      title: 'Profile Banner',
      description: 'Add a banner to highlight important content',
      component: BannerStep,
    },
    {
      id: 'links',
      title: 'Featured Links',
      description: 'Add up to 5 featured links with custom images',
      component: LinksStep,
    },
    {
      id: 'wallets',
      title: 'Wallet Setup',
      description: 'Configure non-custodial wallets for receiving support',
      component: WalletsStep,
    }
  ]

  // Load profile data on mount
  useEffect(() => {
    if (initialData) {
      console.log('🔄 Loading initial data into wizard:', initialData)
      dispatch({ 
        type: 'UPDATE_FORM_DATA', 
        payload: {
          account: initialData.account || {},
          media: initialData.media || [],
          links: initialData.links || [],
          goal: initialData.goal || null,
        }
      })
      
      // Set starting step based on completeness
      const startingStep = determineStartingStep(initialData)
      dispatch({ type: 'SET_CURRENT_STEP', payload: startingStep })
    }
  }, [initialData])

  useEffect(() => {
    // Only load profile data if no initialData was provided
    if (!initialData) {
      console.log('🔄 No initial data provided, loading from API...')
      loadProfileData()
    }
  }, [initialData])

  const loadProfileData = async () => {
    try {
      // Load account data
      const accountResponse = await fetch('http://localhost:3000/api/accounts/info', {
        headers: {
          'Authorization': `Bearer ${auth.getAccessToken()}`,
        },
      })

      let profileData = { account: {}, media: [], links: [] }
      
      if (accountResponse.ok) {
        const accountData = await accountResponse.json()
        
        // Map the new API response structure to our wizard format
        const account = accountData.account || {}
        
        // Handle payment model mapping
        const mappedAccount = {
          ...account,
          // Ensure payment_model exists
          payment_model: account.payment_model || 'donations',
          
          // Map donation amounts from new structure or legacy fields
          donation_amounts: account.donation_amounts || {
            amount_1: account.custom_donation_amount_1 || 5,
            amount_2: account.custom_donation_amount_2 || 10,
            amount_3: account.custom_donation_amount_3 || 25
          },
          
          // Map subscription pricing with defaults
          subscription_pricing: account.subscription_pricing || {
            monthly_price: 10,
            quarterly_price: 27,
            yearly_price: 80
          },
          
          // Keep legacy fields for backwards compatibility
          custom_donation_amount_1: account.donation_amounts?.amount_1 || account.custom_donation_amount_1 || 5,
          custom_donation_amount_2: account.donation_amounts?.amount_2 || account.custom_donation_amount_2 || 10,
          custom_donation_amount_3: account.donation_amounts?.amount_3 || account.custom_donation_amount_3 || 25,
        }
        
        profileData.account = mappedAccount
        profileData.links = accountData.links || []
        profileData.media = accountData.media || []
        
        // Set goal if it exists
        if (accountData.goal) {
          profileData.goal = accountData.goal
        }
      }

      console.log('✅ Profile data loaded with payment model:', profileData)
      dispatch({ type: 'LOAD_PROFILE_DATA', payload: profileData })
      
      // Set starting step based on completeness
      const startingStep = determineStartingStep(profileData)
      dispatch({ type: 'SET_CURRENT_STEP', payload: startingStep })
      
    } catch (error) {
      console.error('❌ Failed to load profile data:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const actions: WizardActions = {
    nextStep: useCallback(() => {
      if (state.currentStep < state.totalSteps - 1) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 })
      }
    }, [state.currentStep, state.totalSteps]),

    prevStep: useCallback(() => {
      if (state.currentStep > 0) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 })
      }
    }, [state.currentStep]),

    goToStep: useCallback((step: number) => {
      if (step >= 0 && step < state.totalSteps) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: step })
      }
    }, [state.totalSteps]),

    updateAccountData: useCallback((data: Partial<WizardFormData['account']>) => {
      dispatch({ type: 'UPDATE_ACCOUNT_DATA', payload: data })
    }, []),

    updateFormData: useCallback((data: Partial<WizardFormData>) => {
      dispatch({ type: 'UPDATE_FORM_DATA', payload: data })
    }, []),

    addMedia: useCallback((media) => {
      const newMedia = [...state.formData.media, { ...media, position: state.formData.media.length }]
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { media: newMedia } })
    }, [state.formData.media]),

    updateMedia: useCallback((index, media) => {
      const updatedMedia = state.formData.media.map((item, i) => 
        i === index ? { ...item, ...media } : item
      )
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { media: updatedMedia } })
    }, [state.formData.media]),

    removeMedia: useCallback((index) => {
      const updatedMedia = state.formData.media.filter((_, i) => i !== index)
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { media: updatedMedia } })
    }, [state.formData.media]),

    addLink: useCallback((link) => {
      const newLinks = [...state.formData.links, { ...link, position: state.formData.links.length }]
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { links: newLinks } })
    }, [state.formData.links]),

    updateLink: useCallback((index, link) => {
      const updatedLinks = state.formData.links.map((item, i) => 
        i === index ? { ...item, ...link } : item
      )
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { links: updatedLinks } })
    }, [state.formData.links]),

    removeLink: useCallback((index) => {
      const updatedLinks = state.formData.links.filter((_, i) => i !== index)
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { links: updatedLinks } })
    }, [state.formData.links]),

    updateGoal: useCallback((goal) => {
      const newGoal: WizardGoal = {
        ...goal,
        current_amount: goal.current_amount || 0,
        progress_percentage: goal.progress_percentage || 0,
        status: 'active',
      }
      dispatch({ type: 'UPDATE_FORM_DATA', payload: { goal: newGoal } })
    }, []),

    togglePreview: useCallback(() => {
      dispatch({ type: 'SET_PREVIEW_MODE', payload: !state.isPreviewMode })
    }, [state.isPreviewMode]),

    uploadImage: async (field: 'profile_image' | 'background_image', file: File) => {
      try {
        console.log(`🖼️ Starting upload for ${field}:`, file.name)
        dispatch({ 
          type: 'SET_UPLOAD_PROGRESS', 
          payload: { field, progress: 0 } 
        })
        
        const response = await (field === 'profile_image' 
          ? profileMediaApi.uploadProfileImage(file)
          : profileMediaApi.uploadBackgroundImage(file))

        console.log(`✅ Upload response for ${field}:`, response)

        const urlField = field === 'profile_image' ? 'profile_image_signed_url' : 'background_image_signed_url'
        const responseUrl = response.profile_image_url || response.background_image_url || response.url || response.signed_url || response

        dispatch({ 
          type: 'UPDATE_ACCOUNT_DATA', 
          payload: { 
            [urlField]: responseUrl
          } 
        })

        dispatch({ 
          type: 'SET_UPLOAD_PROGRESS', 
          payload: { field, progress: 100 } 
        })
        
        console.log(`🎉 Upload complete for ${field}`)
      } catch (error) {
        console.error(`❌ Failed to upload ${field}:`, error)
        dispatch({ 
          type: 'SET_ERROR', 
          payload: { field, error: 'Failed to upload image' } 
        })
      }
    },

    deleteImage: useCallback(async (field: 'profile_image' | 'background_image') => {
      try {
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: { field, progress: 0 } })
        
        if (field === 'profile_image') {
          await profileMediaApi.deleteProfileImage()
          dispatch({ 
            type: 'UPDATE_ACCOUNT_DATA', 
            payload: { profile_image_signed_url: '' } 
          })
        } else if (field === 'background_image') {
          await profileMediaApi.deleteBackgroundImage()
          dispatch({ 
            type: 'UPDATE_ACCOUNT_DATA', 
            payload: { background_image_signed_url: '' } 
          })
        }
        
        // Save the change
        await actions.saveProgress()
        
      } catch (error) {
        console.error(`Failed to delete ${field}:`, error)
        throw error
      }
    }, []),

    saveProgress: useCallback(async () => {
      try {
        const payload: any = {}
        
        // Helper function to convert username to full URL for specific platforms
        const convertToFullUrl = (value: string, platform: string): string => {
          if (!value || !value.trim()) return ''
          
          const trimmedValue = value.trim()
          
          // If it's already a full URL, return as is
          if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
            return trimmedValue
          }
          
          // Convert username to full URL based on platform
          switch (platform) {
            case 'farcaster_url':
              return `https://warpcast.com/${trimmedValue}`
            case 'instagram_url':
              return `https://instagram.com/${trimmedValue}`
            case 'twitter_url':
              return `https://x.com/${trimmedValue}`
            case 'tiktok_url':
              return `https://tiktok.com/@${trimmedValue}`
            case 'youtube_url':
              return trimmedValue.startsWith('@') ? `https://youtube.com/${trimmedValue}` : `https://youtube.com/@${trimmedValue}`
            case 'telegram_url':
              return `https://t.me/${trimmedValue}`
            case 'stream_url':
              return `https://twitch.tv/${trimmedValue}`
            case 'discord_url':
              return trimmedValue.startsWith('discord.gg/') ? `https://${trimmedValue}` : `https://discord.gg/${trimmedValue}`
            default:
              // For website_url, blog_url, require full URLs
              return trimmedValue.startsWith('http') ? trimmedValue : `https://${trimmedValue}`
          }
        }
        
        // Helper function to validate URL format for specific platforms
        const validatePlatformUrl = (value: string, platform: string): boolean => {
          if (!value || !value.trim()) return true // Empty is valid
          
          const trimmedValue = value.trim()
          
          // If it's a full URL, validate it
          if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
            try {
              new URL(trimmedValue)
              return true
            } catch {
              return false
            }
          }
          
          // If it's just a username, validate the format
          switch (platform) {
            case 'farcaster_url':
            case 'instagram_url':
            case 'twitter_url':
            case 'telegram_url':
            case 'stream_url':
              // Allow alphanumeric usernames, underscores, dots, hyphens
              return /^[a-zA-Z0-9._-]+$/.test(trimmedValue)
            case 'tiktok_url':
              // Allow usernames with or without @
              const cleanUsername = trimmedValue.startsWith('@') ? trimmedValue.slice(1) : trimmedValue
              return /^[a-zA-Z0-9._-]+$/.test(cleanUsername)
            case 'youtube_url':
              // Allow usernames with or without @
              const cleanYtUsername = trimmedValue.startsWith('@') ? trimmedValue.slice(1) : trimmedValue
              return /^[a-zA-Z0-9._-]+$/.test(cleanYtUsername)
            case 'discord_url':
              // Allow discord invite codes or full discord.gg links
              return /^[a-zA-Z0-9]+$/.test(trimmedValue) || trimmedValue.includes('discord.gg/')
            default:
              // For website_url, blog_url, require full URLs or valid domains
              return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmedValue) || trimmedValue.startsWith('http')
          }
        }
        
        // Helper function to add field (including empty strings for clearing)
        const addField = (key: string, value: any) => {
          payload[key] = value || ''
        }
        
        // Helper function to add field only if it has a valid value (for optional fields)
        const addIfValid = (key: string, value: any) => {
          if (value && value !== null && value !== undefined && value !== '') {
            payload[key] = value
          }
        }
        
        // Add basic fields (always include these, even if empty)
        addField('display_name', state.formData.account.display_name)
        addField('display_link', state.formData.account.display_link)
        addField('bio', state.formData.account.bio)
        addField('short_bio', state.formData.account.short_bio)
        
        // Validate and add social media URLs
        const socialFields = [
          'website_url', 'instagram_url', 'twitter_url', 'tiktok_url', 
          'farcaster_url', 'youtube_url', 'blog_url', 'stream_url', 
          'telegram_url', 'discord_url'
        ]
        
        for (const field of socialFields) {
          const value = state.formData.account[field as keyof typeof state.formData.account] as string
          
          if (value && value.trim()) {
            // Validate the URL format
            if (!validatePlatformUrl(value, field)) {
              console.error(`❌ Invalid URL format for ${field}:`, value)
              dispatch({ 
                type: 'SET_ERROR', 
                payload: { 
                  field, 
                  error: `Invalid format for ${field.replace('_url', '')}` 
                } 
              })
              throw new Error(`Invalid URL format for ${field}`)
            }
            
            // Convert to full URL if needed
            const fullUrl = convertToFullUrl(value, field)
            addField(field, fullUrl)
          } else {
            addField(field, value)
          }
        }
        
        // Add payment model specific fields based on current model
        const currentPaymentModel = state.formData.account.payment_model || 'donations'

        if (currentPaymentModel === 'donations') {
          // Only add donation fields when in donation mode
          addIfValid('custom_donation_amount_1', state.formData.account.custom_donation_amount_1)
          addIfValid('custom_donation_amount_2', state.formData.account.custom_donation_amount_2)
          addIfValid('custom_donation_amount_3', state.formData.account.custom_donation_amount_3)
        } else if (currentPaymentModel === 'subscriptions') {
          // Only add subscription fields when in subscription mode
          addIfValid('subscription_monthly_price', state.formData.account.subscription_monthly_price)
          addIfValid('subscription_quarterly_price', state.formData.account.subscription_quarterly_price)
          addIfValid('subscription_yearly_price', state.formData.account.subscription_yearly_price)
        }

        // Always include payment model
        addField('payment_model', currentPaymentModel)
        
        // Add other optional fields only if they have values
        addIfValid('link_section_title', state.formData.account.link_section_title)
        addIfValid('support_title', state.formData.account.support_title)
        addIfValid('support_message', state.formData.account.support_message)
        addIfValid('support_image', state.formData.account.support_image)
        addIfValid('background_color', state.formData.account.background_color)
        addIfValid('background_text_color', state.formData.account.background_text_color)

        // Apply step-specific filtering
        let filteredPayload = payload
        const currentStepObj = steps[state.currentStep]
        const currentStepId = currentStepObj?.id

        if (currentStepId === 'profile-basics') {
          // Only send profile basics fields
          const allowedFields = ['display_name', 'display_link', 'bio', 'short_bio', 'background_color']
          filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => allowedFields.includes(key))
          )
        } else if (currentStepId === 'social-links') {
          // Only send social links fields (including bio to prevent erasure)
          const allowedFields = [
            'display_name', 'display_link', 'bio', 'short_bio',
            'website_url', 'instagram_url', 'twitter_url', 'tiktok_url', 'farcaster_url', 
            'youtube_url', 'blog_url', 'stream_url', 'telegram_url', 'discord_url', 'link_section_title'
          ]
          filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => allowedFields.includes(key))
          )
        } else if (currentStepId === 'support-settings') {
          // Only send support fields + payment model specific fields
          const baseFields = [
            'display_name', 'display_link', 'bio', 'short_bio',
            'support_title', 'support_message', 'support_image',
            'payment_model'
          ]
          
          // Add payment model specific fields
          let paymentSpecificFields: string[] = []
          
          if (currentPaymentModel === 'donations') {
            paymentSpecificFields = ['custom_donation_amount_1', 'custom_donation_amount_2', 'custom_donation_amount_3']
          } else if (currentPaymentModel === 'subscriptions') {
            paymentSpecificFields = ['subscription_monthly_price', 'subscription_quarterly_price', 'subscription_yearly_price']
          }
          
          const allowedFields = [...baseFields, ...paymentSpecificFields]
          filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => allowedFields.includes(key))
          )
        } else if (currentStepId === 'background-image') {
          // Only send background image and text color fields (including bio to prevent erasure)
          const allowedFields = [
            'display_name', 'display_link', 'bio', 'short_bio',
            'background_image_signed_url', 'background_text_color'
          ]
          filteredPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => allowedFields.includes(key))
          )
        } else if (currentStepId === 'goals') {
          // Goals step doesn't save account data, it uses separate API
          filteredPayload = {
            display_name: payload.display_name,
            display_link: payload.display_link,
            bio: payload.bio,
            short_bio: payload.short_bio
          }
        }

        console.log(`💾 Saving ${currentStepId} step with filtered payload:`, filteredPayload)
        console.log('📊 Original payload size:', Object.keys(payload).length, 'fields')
        console.log('📊 Filtered payload size:', Object.keys(filteredPayload).length, 'fields')

        // Always send the payload (even if some fields are empty - that's how we clear them)
        const response = await axiosInstance.put('/api/accounts/update', filteredPayload)
        
        console.log('✅ Progress saved successfully:', response.data)
      } catch (error: any) {
        console.error('❌ Failed to save progress:', error)
        throw error
      }
    }, [state.formData, steps, state.currentStep]),

    publishProfile: useCallback(async () => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true })
        
        // Just call saveProgress - same behavior as save
        await actions.saveProgress()
        
        toast.success('Profile saved successfully!')
        
        // Don't call onComplete() - just save like saveProgress does
        
      } catch (error) {
        console.error('Save error:', error)
        toast.error('Failed to save profile')
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false })
      }
    }, []), // Remove onComplete dependency

    resetWizard: useCallback(() => {
      dispatch({ type: 'RESET_WIZARD' })
    }, []),
  }

  const isProfileComplete = (data: WizardFormData) => {
    if (!data || !data.account) return false;

    const required = [
      data.account.display_name && data.account.display_name !== 'string',
      data.account.bio,
      data.account.profile_image_signed_url,
    ]
    
    // Count social links
    const socialLinks = [
      data.account.website_url,
      data.account.instagram_url,
      data.account.twitter_url,
      data.account.tiktok_url,
      data.account.farcaster_url,
      data.account.youtube_url,
      data.account.blog_url,
      data.account.stream_url,
      data.account.telegram_url,
      data.account.discord_url,
    ].filter(link => link && link.trim()).length
    
    const optional = [
      data.links && data.links.length > 0,
      data.media && data.media.length > 0,
      data.goal !== null,
    ]
    
    // Debug logging
    console.log('🔍 Profile Completeness Check:', {
      required: required,
      requiredComplete: required.every(Boolean),
      socialLinks: socialLinks,
      socialLinksComplete: socialLinks >= 3,
      optional: optional,
      optionalComplete: optional.some(Boolean),
      account: {
        display_name: data.account.display_name,
        bio: data.account.bio ? 'has bio' : 'no bio',
        profile_image: data.account.profile_image_signed_url ? 'has image' : 'no image',
      }
    })
    
    // All required + at least 3 social links + at least 1 other optional
    const isComplete = required.every(Boolean) && socialLinks >= 3 && optional.some(Boolean)
    console.log('🎯 Final profile complete result:', isComplete)
    
    return isComplete
  }

  const determineStartingStep = (data: WizardFormData) => {
    if (!data || !data.account) return 0;

    // Check if profile basics are complete
    const profileBasicsComplete = [
      data.account.display_name && data.account.display_name !== 'string',
      data.account.bio,
      data.account.profile_image_signed_url,
    ].every(Boolean)

    // If profile basics are complete, check social links
    if (profileBasicsComplete) {
      const socialLinks = [
        data.account.website_url,
        data.account.instagram_url,
        data.account.twitter_url,
        data.account.tiktok_url,
        data.account.farcaster_url,
        data.account.youtube_url,
        data.account.blog_url,
        data.account.stream_url,
        data.account.telegram_url,
        data.account.discord_url,
      ].filter(link => link && link.trim()).length

      // If we have less than 3 social links, start on social-links step
      if (socialLinks < 3) {
        console.log('🎯 Starting on social-links step (profile basics complete, social incomplete)')
        return 1
      }
    }

    // Default to first step
    console.log('🎯 Starting on profile-basics step')
    return 0
  }

  return (
    <WizardContext.Provider value={{ state, actions, steps }}>
      {children}
    </WizardContext.Provider>
  )
}
export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
