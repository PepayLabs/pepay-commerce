// src/features/profile/wizard/index.tsx
import React from 'react'
import { WizardProvider } from './context/WizardProvider'
import { WizardContent } from './components/WizardContent'
import { toast } from 'sonner'

export default function Profile() {
  const handleComplete = () => {
    console.log('Profile wizard completed!')
    toast.success('Profile saved successfully!')
  }

  return (
    <WizardProvider onComplete={handleComplete}>
      <WizardContent />
    </WizardProvider>
  )
}

export { ProfileWizard } from './ProfileWizard'
