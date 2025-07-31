import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { WizardProvider } from './context/WizardProvider'
import { WizardContent } from './components/WizardContent'
import { ProfileData } from '@/features/profiles/types/profile.types'

interface ProfileWizardProps {
  isOpen?: boolean
  onClose?: () => void
  initialData?: ProfileData
  onComplete?: () => void
}

export function ProfileWizard({ isOpen = true, onClose, initialData, onComplete }: ProfileWizardProps) {
  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    console.log('🔄 ProfileWizard close button clicked')
    if (onClose) {
      onClose()
    }
  }

  // Prevent dialog from closing on outside click if we're in modal mode
  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0" onInteractOutside={(e) => e.preventDefault()}>
        {/* Only show close button if onClose is provided (modal mode) */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20"
            onClick={handleClose}
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        )}
        <WizardProvider initialData={initialData} onComplete={onComplete}>
          <WizardContent />
        </WizardProvider>
      </DialogContent>
    </Dialog>
  )
}