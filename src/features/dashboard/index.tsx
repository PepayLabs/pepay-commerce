import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { useEffect, useState, useRef } from 'react'
import { auth } from '@/lib/auth'
import {
  Receipt,
  Wallet,
  Network,
  InfoIcon,
  Mail,
  Copy
} from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProfileWizard } from '@/features/profile/wizard'
import { Container, Grid, Typography, Box, Alert } from '@mui/material'
import { ProfileSetupCard } from './components/ProfileSetupCard'
import { TotalsCard } from './components/TotalsCard'
import { MainnetAccessCard } from './components/MainnetAccessCard'

export default function Dashboard() {
  const [totals, setTotals] = useState({
    total_invoices: 0,
    total_amount: 0,
    paid_invoices: 0,
    paid_amount: 0,
    pending_invoices: 0,
    pending_amount: 0,
  })

  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const [mainnetAccess, setMainnetAccess] = useState({
    has_mainnet_access: false,
    current_environment: 'devnet'
  })
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessError, setAccessError] = useState('')

  const [showProfileWizard, setShowProfileWizard] = useState(false)
  const [profileData, setProfileData] = useState(null)

  const fetchTotals = async () => {
    const token = auth.getAccessToken()
    console.log('🔑 Using token for totals:', token)
    
    try {
      const response = await fetch('https://api.pepay.io/api/v1/invoices/totals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Totals data:', data)
        setTotals(data)
      } else {
        console.error('❌ Failed to fetch totals:', response.status)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('💥 Fetch failed:', error)
    }
  }

  useEffect(() => {
    fetchTotals()
  }, [])

  useEffect(() => {
    const fetchMainnetAccess = async () => {
      const token = auth.getAccessToken()
      try {
        const response = await fetch('https://api.pepay.io/api/v1/user/mainnet-access/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        setMainnetAccess(data)
      } catch (error) {
        console.error('Failed to fetch mainnet access status:', error)
      }
    }
    fetchMainnetAccess()
  }, [])

  useEffect(() => {
    checkProfileCompleteness()
  }, [])

  const checkProfileCompleteness = async () => {
    console.log('🔍 Checking profile completeness...')
    console.log('🔑 Access token:', auth.getAccessToken())
    
    try {
      const response = await fetch('http://localhost:3000/api/accounts/info', {
        headers: {
          'Authorization': `Bearer ${auth.getAccessToken()}`,
        },
      })
      
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile data received:', data)
        setProfileData(data)
        
        // Use the same logic as the wizard's isProfileComplete function
        const isIncomplete = !isProfileComplete(data)
        
        console.log('🎯 Profile incomplete?', isIncomplete)
        
        if (isIncomplete) {
          setShowProfileWizard(true)
        }
      } else {
        console.log('❌ Response not ok:', await response.text())
      }
    } catch (error) {
      console.error('💥 Failed to check profile:', error)
    }
  }

  // Same logic as WizardProvider's isProfileComplete function
  const isProfileComplete = (data: any) => {
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

  const handleProfileWizardComplete = () => {
    setShowProfileWizard(false)
    checkProfileCompleteness() // Recheck after completion
    toast.success('Profile setup completed!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Email copied to clipboard'))
      .catch(err => toast.error('Failed to copy email'))
  }

  const handleNetworkToggle = async () => {
    if (!mainnetAccess.has_mainnet_access) {
      setIsAccessModalOpen(true)
      return
    }
    console.log(mainnetAccess.current_environment)
    const newEnvironment = mainnetAccess.current_environment === 'mainnet' ? 'devnet' : 'mainnet'
    await toggleEnvironment(newEnvironment)
  }

  const toggleEnvironment = async (environment) => {
    const token = auth.getAccessToken()
    try {
      const response = await fetch('https://api.pepay.io/api/v1/user/environment', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environment })
      })
      
      if (response.ok) {
        setMainnetAccess(prev => ({
          ...prev,
          current_environment: environment
        }))
        toast.success(`Environment switched to ${environment}`)
      } else {
        toast.error('Failed to switch environment')
      }
    } catch (error) {
      console.error('Failed to toggle environment:', error)
      toast.error('Failed to switch environment')
    }
  }

  const submitAccessCode = async () => {
    if (!accessCode.trim()) {
      setAccessError('Please enter an access code')
      return
    }
    
    setIsSubmitting(true)
    setAccessError('')
    
    const token = auth.getAccessToken()
    try {
      const response = await fetch('https://api.pepay.io/api/v1/user/mainnet-access/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_key: accessCode })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Access granted successfully')
        
        // Refetch the status instead of assuming mainnet environment
        try {
          const statusResponse = await fetch('https://api.pepay.io/api/v1/user/mainnet-access/status', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          const statusData = await statusResponse.json()
          setMainnetAccess(statusData)
        } catch (statusError) {
          console.error('Failed to fetch updated mainnet access status:', statusError)
        }
        
        setIsAccessModalOpen(false)
      } else {
        setAccessError(data.message || 'Invalid access code')
      }
    } catch (error) {
      console.error('Failed to activate mainnet access:', error)
      setAccessError('Failed to process your request')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showProfileWizard) {
    return (
      <ProfileWizard 
        isOpen={showProfileWizard}
        onClose={() => {
          console.log('🔄 Dashboard closing ProfileWizard')
          setShowProfileWizard(false)
        }}
        initialData={profileData}
        onComplete={handleProfileWizardComplete}
      />
    )
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Invoices</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    TOTAL INVOICES
                  </CardTitle>
                  <Receipt className='ml-auto size-4' />
                </CardHeader>

                <CardContent>
                  <div className='text-2xl font-bold'>{totals?.total_invoices || 0}</div>

                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    TOTAL PAYMENTS
                  </CardTitle>
                  <Wallet className='ml-auto size-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>${(totals?.total_amount || 0).toLocaleString()}</div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-medium text-green-600">${(totals?.paid_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unpaid</span>
                      <span className="font-medium text-yellow-600">${(totals?.pending_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Development Network Card with Flip Effect */}
              <div 
                className="group h-full" 
                style={{ perspective: "1000px" }}
                onMouseLeave={() => setIsCardFlipped(false)}
              >
                <div 
                  className="relative h-full w-full transition-transform duration-500 ease-in-out" 
                  style={{ 
                    transformStyle: "preserve-3d", 
                    transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)" 
                  }}
                >
                  {/* Front of card */}
                  <Card className="absolute h-full w-full" style={{ backfaceVisibility: "hidden" }}>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>DEVELOPMENT NETWORK</CardTitle>
                      <Network className='ml-auto size-4' />
                    </CardHeader>
                    <CardContent>
                      <div className='flex items-center justify-between'>
                        <span className='inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>
                          Development
                        </span>

                        <div className='mx-2'>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only"
                              checked={mainnetAccess.current_environment === 'mainnet'}
                              onChange={handleNetworkToggle}
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors ${mainnetAccess.current_environment === 'mainnet' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                              <span 
                                className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${mainnetAccess.current_environment === 'mainnet' ? 'translate-x-5' : 'translate-x-0'}`}
                              ></span>
                            </div>
                          </label>
                        </div>

                        <span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10'>
                          Production
                        </span>
                      </div>
                      <div 
                        className="absolute bottom-3 right-3 bg-background/80 p-3 rounded-full hover:bg-background transition-colors duration-200 cursor-help"
                        onMouseEnter={() => setIsCardFlipped(true)}
                      >
                        <InfoIcon className="h-6 w-6 text-muted-foreground hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Back of card */}
                  <Card 
                    className="absolute h-full w-full" 
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)"
                    }}
                  >
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>DEVELOPMENT NETWORK</CardTitle>
                      <Network className='ml-auto size-4' />
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      <p className="mb-2">
                        Selecting your development network determines whether your invoices or apps run on testnet blockchain or mainnet blockchain networks.
                      </p>
                      <p>
                        In order to get access to mainnet you must request the support team:
                      </p>
                      <div 
                        className="flex items-center gap-1 mt-2 text-primary hover:underline cursor-pointer"
                        onClick={() => copyToClipboard('contact@peperuney.pizza')}
                      >
                        <Mail className="h-3 w-3" />
                        <span>contact@peperuney.pizza</span>
                        <Copy className="h-3 w-3" />
                      </div>
                      <div 
                        className="absolute bottom-3 right-3 bg-background/80 p-3 rounded-full hover:bg-background transition-colors duration-200 cursor-help"
                      >
                        <InfoIcon className="h-6 w-6 text-primary hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    SYSTEM STATUS
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />

                    <span className="text-sm text-green-600 dark:text-green-500">Live</span>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      {/* Access Code Modal */}
      <Dialog open={isAccessModalOpen} onOpenChange={setIsAccessModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Production Access Code</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm pt-2">
              In order to ensure the security of our payment system, we require you to contact support to request an access code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="accessCode" className="text-sm font-medium">
                Access Code
              </label>
              <Input
                id="accessCode"
                placeholder="Enter your access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className={accessError ? "border-red-500" : ""}
              />
              {accessError && (
                <p className="text-red-500 text-xs mt-1">{accessError}</p>
              )}
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
              <p>Need an access code? Please contact our support team at <span className="font-semibold">contact@peperuney.pizza</span></p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccessModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAccessCode} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


