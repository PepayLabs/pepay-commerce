import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from 'react'
import { auth } from '@/lib/auth'
import type { User } from '@/lib/auth'
import { User2, Shield, ChevronDown, CheckCircle, AlertCircle, Clock } from 'lucide-react'

import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_API_URL 
        : 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = auth.getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

interface ProfileInfo {
  account: {
    display_name: string
    display_link: string
    email: string
    website_url: string
  }
  media: any[]
  links: any[]
  goal: any
}

interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    display_name: string;
    display_link: string;
    email: string;
  }
}

interface PinUpdatePayload {
  current_pincode: string;
  new_pincode: string;
}

interface VerificationStatus {
  account_type: string
  is_verified: boolean
  npo_verification_requested?: boolean
  influencer_verification_requested?: boolean
  success: boolean
}

// Verification form schemas
const npoVerificationSchema = z.object({
  telegram: z.string().min(1, 'Telegram handle is required').regex(/^@/, 'Telegram handle must start with @'),
  website: z.string().url('Please enter a valid website URL'),
  email: z.string().email('Please enter a valid email address'),
})

const influencerVerificationSchema = z.object({
  verification_link: z.string().url('Please enter a valid verification link'),
})

export default function Settings() {
  const [loadingStates, setLoadingStates] = useState({
    display_name: false,
    display_link: false,
    website_url: false,
    pin: false,
    verification: false,
    verificationStatus: false,
  })
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  
  const token = auth.getAccessToken()
  const user = auth.getUser()

  const profileForm = useForm({
    resolver: zodResolver(z.object({
      display_link: z.string().min(1, 'Display link is required'),
      email: z.string().email('Invalid email format'),
      display_name: z.string().min(1, 'Profile name is required'),
      website_url: z.string().url('Invalid URL format'),
      current_password: z.string().min(1, 'Current password is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      current_pin: z.string()
        .length(6, 'PIN must be 6 digits')
        .regex(/^\d+$/, 'PIN must contain only numbers'),
      new_pin: z.string()
        .length(6, 'PIN must be 6 digits')
        .regex(/^\d+$/, 'PIN must contain only numbers'),
    })),
    defaultValues: {
      display_link: user?.display_link || '',
      email: user?.email || '',
      display_name: user?.display_name || '',
      website_url: user?.website_url || '',
      current_password: '',
      password: '',
      current_pin: '',
      new_pin: '',
    }
  })

  // NPO Verification Form
  const npoForm = useForm({
    resolver: zodResolver(npoVerificationSchema),
    defaultValues: {
      telegram: '',
      website: '',
      email: user?.email || '',
    },
  })

  // Influencer Verification Form  
  const influencerForm = useForm({
    resolver: zodResolver(influencerVerificationSchema),
    defaultValues: {
      verification_link: '',
    },
  })

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    setLoadingStates(prev => ({ ...prev, verificationStatus: true }))
    try {
      const response = await api.get('/api/accounts/verification/status')
      setVerificationStatus(response.data)
    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, verificationStatus: false }))
    }
  }

  useEffect(() => {
    const fetchProfileInfo = async () => {
      setLoadingStates(prev => ({
        ...prev,
        display_name: true,
        display_link: true,
        website_url: true
      }))
      try {
        console.log('profile info')
        const response = await api.get('/api/accounts/info')
        const data: ProfileInfo = response.data
        console.log(data)
        
        // Update the form with profile data
        profileForm.reset({
          ...profileForm.getValues(),
          display_name: data.account.display_name,
          display_link: data.account.display_link,
          email: data.account.email,
          website_url: data.account.website_url,
        })

        // Also update the auth user object with the website_url
        if (user) {
          const updatedUser: User = {
            ...user,
            display_name: data.account.display_name,
            display_link: data.account.display_link,
            email: data.account.email,
            website_url: data.account.website_url
          }
          auth.setUser(updatedUser)
        }

      } catch (error) {
        console.error('Error fetching profile info:', error)
        toast.error('Failed to load profile information')
      } finally {
        setLoadingStates(prev => ({
          ...prev,
          display_name: false,
          display_link: false,
          website_url: false
        }))
      }
    }

    if (token) {
      fetchProfileInfo()
      fetchVerificationStatus()
    }
  }, [token, profileForm])

  const updateProfileInfo = async (fieldData: Partial<ProfileInfo>) => {
    try {
      const response = await api.put('/api/accounts/update', fieldData)
      const data: UpdateProfileResponse = response.data

      // Update local user data
      const updatedUser: User = {
        ...user!,
        ...data.user
      }
      auth.setUser(updatedUser)

      // Show success toast
      toast.success(data.message, {
        description: `Successfully updated ${Object.keys(fieldData)[0].replace('_', ' ')}`
      })

    } catch (error) {
      console.error('Error updating profile info:', error)
      // Show error toast
      toast.error('Update failed', {
        description: 'Failed to update profile information. Please try again.'
      })
    }
  }

  const handleFieldUpdate = async (fieldName: string, value: string) => {
    if (!value.trim()) {
      toast.error('Validation Error', {
        description: `${fieldName.replace('_', ' ')} cannot be empty`
      })
      return
    }

    setLoadingStates(prev => ({ ...prev, [fieldName]: true }))
    try {
      await updateProfileInfo({ [fieldName]: value })
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      toast.error('Update Failed', {
        description: `Failed to update ${fieldName.replace('_', ' ')}. Please try again.`
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [fieldName]: false }))
    }
  }

  const updatePin = async (currentPin: string, newPin: string) => {
    setLoadingStates(prev => ({ ...prev, pin: true }))

    try {
      await api.put('/api/accounts/update-pincode', {
        current_pincode: currentPin,
        new_pincode: newPin
      } as PinUpdatePayload)

      // Show success toast
      toast.success('PIN Updated', {
        description: 'Your PIN has been successfully updated'
      })

      // Reset the PIN fields
      profileForm.reset({
        ...profileForm.getValues(),
        current_pin: '',
        new_pin: ''
      })

    } catch (error) {
      console.error('Error updating PIN:', error)
      // Show error toast
      toast.error('PIN Update Failed', {
        description: 'Failed to update PIN. Please check your current PIN and try again.'
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, pin: false }))
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.put('/api/accounts/update-password', {
        current_password: currentPassword,
        new_password: newPassword
      })

      // Show success toast
      toast.success('Password Updated', {
        description: 'Your password has been successfully updated'
      })

      // Reset the password fields
      profileForm.reset({
        ...profileForm.getValues(),
        current_password: '',
        password: ''
      })

    } catch (error) {
      console.error('Error updating password:', error)
      // Show error toast
      toast.error('Password Update Failed', {
        description: 'Failed to update password. Please check your current password and try again.'
      })
    }
  }

  // Handle NPO verification submission
  const handleNpoVerification = async (values: z.infer<typeof npoVerificationSchema>) => {
    setLoadingStates(prev => ({ ...prev, verification: true }))
    try {
      const response = await api.post('/api/accounts/verification/npo', values)
      toast.success('Verification Request Submitted', {
        description: 'Your NPO verification request has been submitted successfully. We will review it and get back to you.'
      })
      
      // Reset form and refresh status
      npoForm.reset()
      await fetchVerificationStatus()
    } catch (error: any) {
      console.error('NPO verification error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to submit verification request'
      toast.error('Verification Request Failed', {
        description: errorMessage
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, verification: false }))
    }
  }

  // Handle Influencer verification submission
  const handleInfluencerVerification = async (values: z.infer<typeof influencerVerificationSchema>) => {
    setLoadingStates(prev => ({ ...prev, verification: true }))
    try {
      const response = await api.post('/api/accounts/verification/influencer', values)
      toast.success('Verification Request Submitted', {
        description: 'Your influencer verification request has been submitted successfully. We will review it and get back to you.'
      })
      
      // Reset form and refresh status
      influencerForm.reset()
      await fetchVerificationStatus()
    } catch (error: any) {
      console.error('Influencer verification error:', error)
      const errorMessage = error.response?.data?.error || 'Failed to submit verification request'
      toast.error('Verification Request Failed', {
        description: errorMessage
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, verification: false }))
    }
  }

  // Render verification status badge
  const getVerificationBadge = () => {
    if (!verificationStatus) return null
    
    if (verificationStatus.is_verified) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
    }
    
    const hasRequested = verificationStatus.account_type === 'npo' 
      ? verificationStatus.npo_verification_requested 
      : verificationStatus.influencer_verification_requested
      
    if (hasRequested) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>
    }
    
    return <Badge variant="outline" className="bg-red-50 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Not Verified</Badge>
  }

  return (
    <>
      <Header>
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Separator />
          
          <div className="space-y-4">
            {/* Profile Information - Collapsible */}
            <Card>
              <details className="group" open>
                <summary className="cursor-pointer">
                  <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User2 className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle>Profile Information</CardTitle>
                          <CardDescription>
                            Update your profile details and preferences
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-gray-500" />
                    </div>
                  </CardHeader>
                </summary>
                <CardContent className="space-y-6">
                  <Form {...profileForm}>
                    {/* Display Link (Username) */}
                    <FormField
                      control={profileForm.control}
                      name="display_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter your username"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => handleFieldUpdate('display_link', field.value)}
                              disabled={loadingStates.display_link}
                              size="sm"
                            >
                              {loadingStates.display_link ? 'Updating...' : 'Update'}
                            </Button>
                          </div>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email (Read-only) */}
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              disabled
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>
                            Your email address cannot be changed.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    {/* Display Name */}
                    <FormField
                      control={profileForm.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Name</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter your profile name"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => handleFieldUpdate('display_name', field.value)}
                              disabled={loadingStates.display_name}
                              size="sm"
                            >
                              {loadingStates.display_name ? 'Updating...' : 'Update'}
                            </Button>
                          </div>
                          <FormDescription>
                            Your full name or profile display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Website URL */}
                    <FormField
                      control={profileForm.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="https://yourwebsite.com"
                                type="url"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={() => handleFieldUpdate('website_url', field.value)}
                              disabled={loadingStates.website_url}
                              size="sm"
                            >
                              {loadingStates.website_url ? 'Updating...' : 'Update'}
                            </Button>
                          </div>
                          <FormDescription>
                            Your company or personal website URL.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>
                </CardContent>
              </details>
            </Card>

            {/* Verification - Collapsible */}
            <Card>
              <details className="group">
                <summary className="cursor-pointer">
                  <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Verification
                            {getVerificationBadge()}
                          </CardTitle>
                          <CardDescription>
                            Verify your account to gain credibility and trust
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-gray-500" />
                    </div>
                  </CardHeader>
                </summary>
                <CardContent className="space-y-6">
                  {loadingStates.verificationStatus ? (
                    <div className="text-center py-4">Loading verification status...</div>
                  ) : verificationStatus?.is_verified ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800 mb-2">Account Verified!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your account has been successfully verified. You now have a verified badge on your profile.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Check if verification already requested */}
                      {((verificationStatus?.account_type === 'npo' && verificationStatus?.npo_verification_requested) ||
                        (verificationStatus?.account_type === 'influencer' && verificationStatus?.influencer_verification_requested)) ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-yellow-800 mb-2">Verification Under Review</h3>
                          <p className="text-sm text-muted-foreground">
                            Your verification request is currently being reviewed. We'll notify you once the review is complete.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* NPO Verification Form */}
                          {verificationStatus?.account_type === 'npo' && (
                            <div className="space-y-4">
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">NPO Verification Requirements</h4>
                                <p className="text-sm text-blue-800 mb-3">
                                  To verify your non-profit organization, please provide your most relevant information:
                                </p>
                                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                  <li>Your official Telegram handle for direct communication</li>
                                  <li>Your organization's primary website or cause-related page</li>
                                  <li>Primary contact email for verification purposes</li>
                                </ul>
                              </div>
                              
                              <Form {...npoForm}>
                                <form onSubmit={npoForm.handleSubmit(handleNpoVerification)} className="space-y-4">
                                  <FormField
                                    control={npoForm.control}
                                    name="telegram"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Telegram Handle</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field}
                                            placeholder="@your_organization"
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Your organization's official Telegram handle
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={npoForm.control}
                                    name="website"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Organization Website</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field}
                                            placeholder="https://your-organization.org"
                                            type="url"
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Your organization's official website or most relevant cause page
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={npoForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field}
                                            placeholder="contact@your-organization.org"
                                            type="email"
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Primary contact email for verification communication
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <Button
                                    type="submit"
                                    disabled={loadingStates.verification}
                                    className="w-full"
                                  >
                                    {loadingStates.verification ? 'Submitting Request...' : 'Submit NPO Verification Request'}
                                  </Button>
                                </form>
                              </Form>
                            </div>
                          )}

                          {/* Influencer Verification Form */}
                          {verificationStatus?.account_type === 'influencer' && (
                            <div className="space-y-4">
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="font-medium text-purple-900 mb-2">Influencer Verification Requirements</h4>
                                <p className="text-sm text-purple-800 mb-3">
                                  To verify your influencer account, you need to prove your identity:
                                </p>
                                <ul className="text-sm text-purple-800 list-disc list-inside space-y-1">
                                  <li>Provide a link to your official social media profile (Instagram, Twitter, TikTok, etc.)</li>
                                  <li>Your profile must contain a link to your GrabMeASlice profile</li>
                                  <li>This allows us to verify that you are really who you say you are</li>
                                  <li>Select verified early users are elegible for special $Runey airdrops</li>

                                </ul>
                              </div>
                              
                              <Form {...influencerForm}>
                                <form onSubmit={influencerForm.handleSubmit(handleInfluencerVerification)} className="space-y-4">
                                  <FormField
                                    control={influencerForm.control}
                                    name="verification_link"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Verification Link</FormLabel>
                                        <FormControl>
                                          <Input 
                                            {...field}
                                            placeholder="https://instagram.com/yourusername or https://twitter.com/yourusername"
                                            type="url"
                                          />
                                        </FormControl>
                                        <FormDescription>
                                          Link to your official profile that contains a link back to your GrabMeASlice profile
                                        </FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <Button
                                    type="submit"
                                    disabled={loadingStates.verification}
                                    className="w-full"
                                  >
                                    {loadingStates.verification ? 'Submitting Request...' : 'Submit Influencer Verification Request'}
                                  </Button>
                                </form>
                              </Form>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </details>
            </Card>

            {/* Security Settings - Collapsible */}
            <Card>
              <details className="group">
                <summary className="cursor-pointer">
                  <CardHeader className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-red-600" />
                        <div>
                          <CardTitle>Security Settings</CardTitle>
                          <CardDescription>
                            Manage your password and PIN settings
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 text-gray-500" />
                    </div>
                  </CardHeader>
                </summary>
                <CardContent className="space-y-6">
                  <Form {...profileForm}>
                    {/* Password Update */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Update Password</h4>
                      <FormField
                        control={profileForm.control}
                        name="current_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                type="password"
                                placeholder="Enter current password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                type="password"
                                placeholder="Enter new password"
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const currentPassword = profileForm.getValues('current_password')
                          const newPassword = profileForm.getValues('password')
                          if (currentPassword && newPassword) {
                            updatePassword(currentPassword, newPassword)
                          }
                        }}
                        className="w-full"
                      >
                        Update Password
                      </Button>
                    </div>

                    <Separator />

                    {/* PIN Update */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Update PIN</h4>
                      <FormField
                        control={profileForm.control}
                        name="current_pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current PIN</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                type="password"
                                placeholder="Enter current 6-digit PIN"
                                maxLength={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="new_pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New PIN</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                type="password"
                                placeholder="Enter new 6-digit PIN"
                                maxLength={6}
                              />
                            </FormControl>
                            <FormDescription>
                              PIN must be exactly 6 digits.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const currentPin = profileForm.getValues('current_pin')
                          const newPin = profileForm.getValues('new_pin')
                          if (currentPin && newPin) {
                            updatePin(currentPin, newPin)
                          }
                        }}
                        disabled={loadingStates.pin}
                        className="w-full"
                      >
                        {loadingStates.pin ? 'Updating PIN...' : 'Update PIN'}
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </details>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
