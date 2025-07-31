import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  ArrowBack,
  ArrowForward,
  Preview,
  Save,
  Publish,
} from '@mui/icons-material'
import { useWizard } from '../context/WizardProvider'

export function WizardNavigation() {
  const { state, actions, steps } = useWizard()
  
  const isFirstStep = state.currentStep === 0
  const isLastStep = state.currentStep === state.totalSteps - 1
  const currentStep = steps[state.currentStep]

  return (
    <Box>
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left side - Back button */}
        <Box>
          {!isFirstStep && (
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={actions.prevStep}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
          )}
        </Box>

        {/* Center - Action buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={state.isPreviewMode ? 'Hide Preview' : 'Show Preview'}>
            <IconButton
              onClick={actions.togglePreview}
              color={state.isPreviewMode ? 'primary' : 'default'}
              sx={{ 
                bgcolor: state.isPreviewMode ? 'primary.50' : 'transparent',
                '&:hover': { bgcolor: state.isPreviewMode ? 'primary.100' : 'grey.100' }
              }}
            >
              <Preview />
            </IconButton>
          </Tooltip>

          {state.isDirty && (
            <Tooltip title="Save Progress">
              <IconButton
                onClick={actions.saveProgress}
                disabled={state.isSaving}
                color="success"
              >
                <Save />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Right side - Next/Finish button */}
        <Box>
          {isLastStep ? (
            <Button
              variant="contained"
              startIcon={<Publish />}
              onClick={actions.publishProfile}
              disabled={state.isSaving}
              sx={{ 
                bgcolor: 'success.main',
                '&:hover': { bgcolor: 'success.dark' }
              }}
            >
              {state.isSaving ? 'Publishing...' : 'Publish Profile'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={actions.nextStep}
            >
              {currentStep?.isOptional ? 'Skip' : 'Continue'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}