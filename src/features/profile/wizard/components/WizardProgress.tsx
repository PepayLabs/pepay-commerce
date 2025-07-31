import {
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from '@mui/material'
import { Check } from '@mui/icons-material'
import { useWizard } from '../context/WizardProvider'

export function WizardProgress() {
  const { state, steps } = useWizard()
  const theme = useTheme()
  
  const progress = ((state.currentStep + 1) / state.totalSteps) * 100
  const currentStep = steps[state.currentStep]

  // Calculate which steps to show (sliding window of 3)
  const getVisibleSteps = () => {
    const currentIndex = state.currentStep
    const totalSteps = steps.length
    
    if (totalSteps <= 3) {
      // If 3 or fewer steps, show all
      return steps.map((step, index) => ({ step, originalIndex: index }))
    }
    
    let startIndex, endIndex
    
    if (currentIndex <= 1) {
      // Steps 0-1: Show first 3 steps (0, 1, 2)
      startIndex = 0
      endIndex = 2
    } else if (currentIndex >= totalSteps - 2) {
      // Last 2 steps: Show last 3 steps 
      startIndex = totalSteps - 3
      endIndex = totalSteps - 1
    } else {
      // Middle steps: Show current step in the middle
      startIndex = currentIndex - 1
      endIndex = currentIndex + 1
    }
    
    return steps.slice(startIndex, endIndex + 1).map((step, index) => ({
      step,
      originalIndex: startIndex + index
    }))
  }

  const visibleSteps = getVisibleSteps()

  return (
    <Box>
      {/* Step Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Step {state.currentStep + 1} of {state.totalSteps}
        </Typography>
        <Typography variant="h5" sx={{ mb: 1 }}>
          {currentStep?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentStep?.description}
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'right' }}>
          {Math.round(progress)}% complete
        </Typography>
      </Box>

      {/* Step Indicators - Sliding Window */}
      <Stepper activeStep={state.currentStep} orientation="horizontal">
        {visibleSteps.map(({ step, originalIndex }) => (
          <Step key={step.id} completed={originalIndex < state.currentStep}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: completed 
                      ? 'success.main' 
                      : (originalIndex === state.currentStep)
                      ? 'primary.main' 
                      : 'grey.300',
                    color: (completed || originalIndex === state.currentStep) ? 'white' : 'text.secondary',
                  }}
                >
                  {completed ? <Check sx={{ fontSize: 16 }} /> : originalIndex + 1}
                </Box>
              )}
            >
              <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'block' } }}>
                {step.title}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}