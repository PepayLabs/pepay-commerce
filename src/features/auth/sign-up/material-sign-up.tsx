import { useState } from 'react'
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
  Checkbox,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff,
  Home as HomeIcon,
  Description as DocumentIcon,
  Settings as SettingsIcon,
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
  display_link: z.string().min(1, 'Display link is required'),
  email: z.string().email('Invalid email'),
  display_name: z.string().min(1, 'Display name is required'),
  account_type: z.string().min(1, 'Account type is required'),
  password: z.string().min(7, 'Password must be at least 7 characters'),
  pincode: z.string().length(6, 'Pincode must be exactly 6 characters'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the Terms of Service and Privacy Policy'
  })
});

export default function MaterialSignUp() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPincode, setShowPincode] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_link: '',
      email: '',
      display_name: '',
      account_type: '',
      password: '',
      pincode: '',
      termsAccepted: false
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      
      // Remove termsAccepted from the request body and map account_type
      const { termsAccepted, account_type, ...restValues } = values
      
      // Map display values to database values
      const mappedAccountType = account_type === 'Creator' ? 'influencer' : 'npo'
      
      const requestBody = {
        ...restValues,
        account_type: mappedAccountType
      }
      
      const response = await fetch('http://localhost:3000/api/accounts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Signup failed')
      }

      // Store new auth data structure matching the login response
      auth.setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_in: data.token_expires_in || 3600 // Default if not provided
      })
      
      auth.setUser({
        account_id: data.account.account_id,
        email: data.account.email,
        display_name: data.account.display_name,
        display_link: data.account.display_link,
        is_verified: data.account.is_verified
      })

      toast.success('Account created!')
      navigate({ to: '/' })
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Signup failed')
    } finally {
      setIsLoading(false)
    }
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
            maxWidth: 550,
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
              Create your Grab Me A Slice Account
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mt: 0.5, textAlign: 'center' }}
            >
              Enter your information to get started
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            {/* Form fields in two columns for wider screens */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <Controller
                name="display_link"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    placeholder="@ansem"
                    variant="outlined"
                    fullWidth
                    error={!!errors.display_link}
                    helperText={errors.display_link?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  />
                )}
              />
              
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="Email"
                    placeholder="user@example.com"
                    variant="outlined"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  />
                )}
              />
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <Controller
                name="display_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    placeholder="John Appleseed"
                    variant="outlined"
                    fullWidth
                    error={!!errors.display_name}
                    helperText={errors.display_name?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  />
                )}
              />

              <Controller
                name="account_type"
                control={control}
                render={({ field }) => (
                  <FormControl 
                    fullWidth 
                    error={!!errors.account_type}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                  >
                    <InputLabel>Account Type</InputLabel>
                    <Select
                      {...field}
                      label="Account Type"
                      variant="outlined"
                    >
                      <MenuItem value="Creator">Creator</MenuItem>
                      <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                    </Select>
                    {errors.account_type && (
                      <Typography 
                        variant="caption" 
                        color="error"
                        sx={{ ml: 1.5, mt: 0.5 }}
                      >
                        {errors.account_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Password"
                    variant="outlined"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
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
                      )
                    }}
                  />
                )}
              />
              
              <Controller
                name="pincode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPincode ? 'text' : 'password'}
                    label="Pincode"
                    placeholder="6-digit security code"
                    variant="outlined"
                    fullWidth
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                    inputProps={{
                      maxLength: 6,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPincode(!showPincode)}
                            edge="end"
                            size="small"
                          >
                            {showPincode ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Box>

            {/* Terms acceptance checkbox - redesigned */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <Box 
                    sx={{
                      border: errors.termsAccepted ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 1.5,
                      backgroundColor: 'rgba(0,0,0,0.01)'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5
                    }}>
                      <Checkbox
                        {...field}
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        size="small"
                        sx={{ 
                          padding: '2px',
                          mt: '1px'
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        I agree to Grab Me A Slice's{' '}
                        <MuiLink 
                          component={Link}
                          to="/terms"
                          color="primary" 
                          sx={{ fontSize: '0.875rem' }}
                        >
                          Terms of Service
                        </MuiLink>
                        {' '}and{' '}
                        <MuiLink 
                          component={Link}
                          to="/privacy"
                          color="primary" 
                          sx={{ fontSize: '0.875rem' }}
                        >
                          Privacy Policy
                        </MuiLink>
                      </Typography>
                    </Box>
                    {errors.termsAccepted && (
                      <Typography 
                        variant="caption" 
                        color="error"
                        sx={{ ml: 4, display: 'block', mt: 0.5 }}
                      >
                        {errors.termsAccepted.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            {/* Account link */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start',
              mt: 0.5
            }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
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

            {/* Submit button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              mt: 2
            }}>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={isLoading}
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
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </Box>
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