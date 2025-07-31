import { createTheme } from '@mui/material/styles'

export const wizardTheme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Blue-500
    },
    secondary: {
      main: '#8b5cf6', // Purple-500
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})