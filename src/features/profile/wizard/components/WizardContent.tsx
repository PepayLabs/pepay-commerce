import React from 'react'
import { ThemeProvider } from '@mui/material'
import { useWizard } from '../context/WizardProvider'
import { WizardProgress } from './WizardProgress'
import { WizardNavigation } from './WizardNavigation'
import { ProfilePreview } from './ProfilePreview'
import { wizardTheme } from '../theme/wizardTheme'

interface WizardContentProps {
  embedded?: boolean
}

export function WizardContent({ embedded = false }: WizardContentProps) {
  const { state, steps } = useWizard()
  
  const currentStep = steps[state.currentStep]
  const CurrentStepComponent = currentStep?.component

  if (!CurrentStepComponent) {
    return <div>Loading step...</div>
  }

  return (
    <ThemeProvider theme={wizardTheme}>
      <div className={`
        flex 
        ${state.isPreviewMode ? 'flex-col lg:flex-row' : 'flex-col'} 
        ${embedded ? 'min-h-[80vh]' : 'h-[90vh]'}
      `}>
        {/* Form Panel */}
        <div className={`
          ${state.isPreviewMode 
            ? 'w-full lg:w-1/2 h-full lg:h-full' 
            : 'w-full h-full'
          } 
          flex flex-col
        `}>
          {/* Header */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-b">
            <WizardProgress />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <CurrentStepComponent />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-t">
            <WizardNavigation />
          </div>
        </div>

        {/* Preview Panel - Below on mobile, right side on desktop */}
        {state.isPreviewMode && (
          <div className={`
            w-full lg:w-1/2
            ${embedded ? 'min-h-[60vh]' : 'h-[50vh] lg:h-full'}
            border-t lg:border-t-0 lg:border-l 
            overflow-hidden
          `}>
            <ProfilePreview />
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}