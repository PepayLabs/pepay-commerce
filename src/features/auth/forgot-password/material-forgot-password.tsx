import { useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  ThemeProvider,
  createTheme,
  Link as MuiLink,
  Paper,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import { 
  InfoOutlined,
  Home as HomeIcon,
  Description as DocumentIcon,
  Settings as SettingsIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material'
import { Link } from '@tanstack/react-router'

// Create Google-style theme (matching the other auth forms)
const googleTheme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
    },
  },
  typography: {
    fontFamily: '"Google Sans","Noto Sans",Roboto,Arial,sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 4,
          boxShadow: 'none',
          padding: '0.5rem 1.5rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#dadce0',
            },
            '&:hover fieldset': {
              borderColor: '#dadce0',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          fontWeight: 500,
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
});

// Form schema with validation
const formSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export default function MaterialForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    console.log(values)
    // This would normally call an API, but since recovery is not supported,
    // we'd never actually submit this form
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <ThemeProvider theme={googleTheme}>
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2
      }}>
        <Box 
          sx={{ 
            width: '100%',
            maxWidth: 450,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            border: '1px solid #dadce0',
            py: 5,
            px: 6,
          }}
        >
          {/* Logo and title */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}>
            <Box
              component="img"
              src="/images/gmas-app-square.png"
              alt="Grab Me A Slice Logo"
              sx={{ 
                height: 80,
                width: 80,
                borderRadius: '12px',
                objectFit: 'cover',
                mb: 3,
                p: 0,
                overflow: 'hidden'
              }}
            />
            <Typography 
              variant="h5" 
              component="h1"
              sx={{ 
                fontWeight: 600,
                fontSize: '1.75rem',
                textAlign: 'center',
                color: 'text.primary',
                letterSpacing: '-0.25px'
              }}
            >
              Forgot Password
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mt: 0.5, textAlign: 'center' }}
            >
              Reset your password
            </Typography>
          </Box>

          {/* Security alert */}
          <Alert 
            severity="info" 
            icon={<InfoOutlined fontSize="inherit" />}
            sx={{ 
              mb: 4, 
              bgcolor: '#e8f0fe',
              color: '#1967d2',
              '& .MuiAlert-icon': { color: '#1967d2' }
            }}
          >
            Currently we do not support account recovery for security reasons.
          </Alert>

          {/* Form */}
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ 
              filter: 'blur(1px)', 
              opacity: 0.6, 
              pointerEvents: 'none'
            }}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Enter your email"
                  variant="outlined"
                  fullWidth
                  disabled
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              )}
            />

            {/* Submit button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              mt: 2
            }}>
              <Button
                type="submit"
                variant="contained"
                disabled
                disableElevation
                sx={{ 
                  py: 1,
                  px: 3,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  bgcolor: '#000000',
                  color: '#ffffff',
                  '&:hover': {
                    bgcolor: '#333333',
                  },
                  '&:disabled': {
                    bgcolor: '#cccccc',
                    color: '#666666',
                  }
                }}
              >
                Reset Password
              </Button>
            </Box>
          </Box>

          {/* Account links */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: 3
          }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <MuiLink 
                component={Link}
                to="/sign-in"
                color="primary"
                sx={{ 
                  fontSize: '0.875rem',
                }}
              >
                Sign in
              </MuiLink>
            </Typography>
          </Box>

          {/* Terms and policies */}
          <Box 
            sx={{ 
              mt: 5,
              pt: 2,
              borderTop: '1px solid #dadce0',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
              }}
            >
              By continuing, you agree to Pepay's{' '}
              <MuiLink 
                component={Link}
                to="/terms"
                color="primary" 
                sx={{ fontSize: '0.75rem' }}
              >
                Terms of Service
              </MuiLink>
              {' '}and{' '}
              <MuiLink 
                component={Link}
                to="/privacy"
                color="primary" 
                sx={{ fontSize: '0.75rem' }}
              >
                Privacy Policy
              </MuiLink>
            </Typography>
          </Box>

          {/* Social media and navigation icons */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              px: 1
            }}
          >
            {/* Social Media Icons - Left side */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Twitter">
                <IconButton 
                  component="a" 
                  href="https://twitter.com/pepay" 
                  target="_blank"
                  size="small"
                  sx={{ 
                    color: '#9e9e9e',
                    '&:hover': { color: '#1DA1F2' }
                  }}
                >
                  <TwitterIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Telegram">
                <IconButton 
                  component="a" 
                  href="https://t.me/pepay" 
                  target="_blank"
                  size="small"
                  sx={{ 
                    color: '#9e9e9e',
                    '&:hover': { color: '#0088cc' }
                  }}
                >
                  <TelegramIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Navigation Icons - Right side */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Home">
                <IconButton 
                  component={Link}
                  to="/"
                  size="small"
                  sx={{ 
                    color: '#9e9e9e',
                    '&:hover': { color: '#5f6368' }
                  }}
                >
                  <HomeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Terms of Service">
                <IconButton 
                  component={Link}
                  to="/terms"
                  size="small"
                  sx={{ 
                    color: '#9e9e9e',
                    '&:hover': { color: '#5f6368' }
                  }}
                >
                  <DocumentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Privacy Policy">
                <IconButton 
                  component={Link}
                  to="/privacy"
                  size="small"
                  sx={{ 
                    color: '#9e9e9e',
                    '&:hover': { color: '#5f6368' }
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}