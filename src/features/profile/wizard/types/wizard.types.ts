import { ProfileAccount, ProfileMedia, ProfileLink, ProfileGoal } from '@/features/profiles/types/profile.types'

export interface WizardStep {
    id: string
    title: string
    description: string
    component: React.ComponentType
    isOptional?: boolean
    isCompleted?: boolean
  }
  
  // Match your actual API account structure with new payment model
  export interface WizardAccountData {
    account_id?: string
    email?: string
    display_name: string
    display_link: string
    bio: string
    short_bio: string
    website_url: string
    instagram_url: string
    twitter_url: string
    tiktok_url: string
    farcaster_url: string
    youtube_url: string
    blog_url: string
    stream_url: string
    telegram_url: string
    discord_url: string
    link_section_title: string
    background_color: string
    banner_title: string
    banner_color: string
    banner_button_text: string
    banner_button_link: string
    account_type: string
    npo_mission: string
    
    // New payment model structure
    payment_model: 'donations' | 'subscriptions'
    donation_amounts?: {
      amount_1: number
      amount_2: number
      amount_3: number
    }
    subscription_pricing?: {
      monthly_price: number
      quarterly_price: number
      yearly_price: number
    }
    
    // Legacy fields (keep for backwards compatibility during transition)
    custom_donation_amount_1?: number
    custom_donation_amount_2?: number
    custom_donation_amount_3?: number
    
    support_image: number
    support_message: string
    support_title: string
    is_verified?: boolean
    is_active?: boolean
    profile_image_signed_url: string
    background_image_signed_url: string
    banner_image_signed_url: string
    background_text_color: string
  }
  
  export interface WizardMedia {
    media_id?: number
    media_type: 'photo' | 'video'
    description: string
    position: number
    signed_url: string
    file?: File // For uploads during wizard
  }
  
  export interface WizardLink {
    link_id?: number
    position: number
    title: string
    url: string
    color: string
    signed_image_url: string
    image_file?: File // For uploads during wizard
  }
  
  export interface WizardGoal {
    id: string
    title: string
    description: string
    goal_amount: number
    current_amount: number
    progress_percentage: number
    start_date: string
    end_date: string
    goal_type: 'monthly' | 'custom'
    status: 'active' | 'completed' | 'cancelled'
    is_visible: boolean
    is_featured: boolean
    created_at?: string
    updated_at?: string
  }
  
  export interface WizardFormData {
    account: WizardAccountData
    media: WizardMedia[]
    links: WizardLink[]
    goal?: WizardGoal
  }
  
  export interface WizardState {
    currentStep: number
    totalSteps: number
    formData: WizardFormData
    isPreviewMode: boolean
    isDirty: boolean
    errors: Record<string, string>
    isLoading: boolean
    isSaving: boolean
    uploadProgress: Record<string, number>
  }
  
  type WizardAction =
    | { type: 'SET_CURRENT_STEP'; payload: number }
    | { type: 'UPDATE_FORM_DATA'; payload: Partial<WizardFormData> }
    | { type: 'UPDATE_ACCOUNT_DATA'; payload: Partial<WizardFormData['account']> }
    | { type: 'SET_PREVIEW_MODE'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SAVING'; payload: boolean }
    | { type: 'SET_DIRTY'; payload: boolean }
    | { type: 'SET_ERRORS'; payload: Record<string, string> }
    | { type: 'SET_ERROR'; payload: { field: string; error: string } }
    | { type: 'SET_UPLOAD_PROGRESS'; payload: { field: string; progress: number } }
    | { type: 'LOAD_PROFILE_DATA'; payload: WizardFormData }
    | { type: 'RESET_WIZARD' }
  
  export interface WizardActions {
    nextStep: () => void
    prevStep: () => void
    goToStep: (step: number) => void
    updateAccountData: (data: Partial<WizardAccountData>) => void
    updateFormData: (data: Partial<WizardFormData>) => void
    addMedia: (media: WizardMedia) => void
    updateMedia: (index: number, media: Partial<WizardMedia>) => void
    removeMedia: (index: number) => void
    addLink: (link: WizardLink) => void
    updateLink: (index: number, link: Partial<WizardLink>) => void
    removeLink: (index: number) => void
    updateGoal: (goal: Partial<WizardGoal>) => void
    togglePreview: () => void
    saveProgress: () => Promise<void>
    publishProfile: () => Promise<void>
    resetWizard: () => void
    uploadImage: (field: 'profile_image' | 'background_image', file: File) => Promise<void>
    deleteImage: (field: 'profile_image' | 'background_image') => Promise<void>
  }