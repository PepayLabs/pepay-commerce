import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from '@tanstack/react-router'
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Link as MuiLink,
  ThemeProvider,
  createTheme,
  Tooltip,
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  Home as HomeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Description as DocumentIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material'
import { auth } from '@/lib/auth'
import { toast } from 'sonner'

// Create Google-style theme
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
          color: '#1a73e8',
          fontWeight: 500,
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
})

const formSchema = z.object({
  email: z.string().min(1, 'Please enter your email or username'),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export default function MaterialSignIn() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3000/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed')
      }

      // Store new auth data structure
      auth.setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_in: data.token_expires_in
      })
      
      auth.setUser({
        account_id: data.account.account_id,
        email: data.account.email,
        display_name: data.account.display_name,
        display_link: data.account.display_link,
        is_verified: data.account.is_verified
      })

      toast.success('Logged in successfully!')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
    <ThemeProvider theme={googleTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: 4,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <img
                src="/images/gmas-app-square.png"
                alt="Grab Me A Slice Logo"
                style={{ height: 40, marginRight: 8 }}
              />
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#202124' }}>
                Grab Me A Slice
              </Typography>
            </Box>
            <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              to continue to pepay
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email or Username"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 2, 
                mb: 2,
                height: 48,
                fontSize: '1rem'
              }}
            >
              {isLoading ? 'Signing in...' : 'Next'}
            </Button>
          </Box>

          {/* Links */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MuiLink component={Link} to="/sign-up" variant="body2">
              Create account
            </MuiLink>
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
                  href="https://twitter.com/peperuneypizza" 
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