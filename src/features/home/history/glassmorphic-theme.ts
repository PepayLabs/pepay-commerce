import { createTheme, alpha } from '@mui/material/styles';

// Design system constants
const BLUR_AMOUNT = '50px';
const BORDER_LIGHT = '1px solid rgba(255, 255, 255, 0.25)';
const BORDER_DARK = '1px solid rgba(255, 255, 255, 0.1)';
const ANIMATION_DURATION = '180ms';
const MACOS_BLUE = '#0a84ff';
const YELLOW_COMPLEMENTARY = '#6442d6'; // Purple that works well with yellow

// Create a comprehensive glassmorphic Material theme
export const glassmorphicTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: YELLOW_COMPLEMENTARY,
      light: alpha(YELLOW_COMPLEMENTARY, 0.8),
      dark: '#5335b9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: MACOS_BLUE,
      light: alpha(MACOS_BLUE, 0.8),
      dark: '#0066cc',
      contrastText: '#ffffff',
    },
    background: {
      default: 'rgba(255, 251, 254, 0.5)',
      paper: 'rgba(255, 255, 255, 0.25)', // 25% opacity as requested
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(255, 255, 255, 0.3)',
  },
  shape: {
    borderRadius: 20, // 20px rounded corners
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "SF Pro Display", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 500,
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '-0.005em',
    },
    subtitle1: {
      letterSpacing: '0.01em',
    },
    subtitle2: {
      letterSpacing: '0.01em',
      fontWeight: 500,
    },
    body1: {
      letterSpacing: '0.011em',
      lineHeight: 1.6,
    },
    body2: {
      letterSpacing: '0.011em',
      lineHeight: 1.5,
    },
    button: {
      letterSpacing: '0.02em',
      fontWeight: 500,
    },
  },
  spacing: 8, // Base spacing unit (Material 3 uses 8px grid)
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: `background-color ${ANIMATION_DURATION} ease-out`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          border: BORDER_LIGHT,
          boxShadow: '0 2px 12px rgba(31, 38, 135, 0.15)',
          transition: `all ${ANIMATION_DURATION} ease-out`,
        },
        elevation1: {
          boxShadow: '0 2px 10px rgba(31, 38, 135, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 14px rgba(31, 38, 135, 0.12)',
        },
        elevation3: {
          boxShadow: '0 5px 18px rgba(31, 38, 135, 0.14)',
        },
        elevation4: {
          boxShadow: '0 6px 20px rgba(31, 38, 135, 0.16)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(255, 255, 255, 0.25)', // 25% opacity
          border: BORDER_LIGHT,
          boxShadow: '0 2px 12px rgba(31, 38, 135, 0.15)',
          transition: `all ${ANIMATION_DURATION} ease-out`,
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(31, 38, 135, 0.2)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24, // 24px gutters
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(156.52deg, rgba(255, 255, 255, 0.4) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.1) 93.02%)',
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          borderRight: BORDER_LIGHT,
          boxShadow: '4px 0 16px rgba(31, 38, 135, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          boxShadow: '0 2px 6px rgba(31, 38, 135, 0.15)',
          borderRadius: 100,
          textTransform: 'none',
          fontWeight: 500,
          letterSpacing: '0.02em',
          padding: '8px 24px',
          transition: `all ${ANIMATION_DURATION} ease-out`,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(31, 38, 135, 0.2)',
          },
        },
        contained: {
          backgroundColor: alpha(YELLOW_COMPLEMENTARY, 0.8),
          color: '#ffffff',
          '&:hover': {
            backgroundColor: YELLOW_COMPLEMENTARY,
          },
        },
        outlined: {
          borderColor: alpha(YELLOW_COMPLEMENTARY, 0.5),
          '&:hover': {
            borderColor: YELLOW_COMPLEMENTARY,
            backgroundColor: alpha(YELLOW_COMPLEMENTARY, 0.05),
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(YELLOW_COMPLEMENTARY, 0.05),
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: 'none',
          borderBottom: BORDER_LIGHT,
          color: 'rgba(0, 0, 0, 0.87)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: `all ${ANIMATION_DURATION} ease-out`,
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(103, 80, 164, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(103, 80, 164, 0.15)',
            },
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 12,
          border: BORDER_LIGHT,
          padding: '12px 16px',
          transition: `all ${ANIMATION_DURATION} ease-out`,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
          },
          '&:focus-within': {
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: `0 0 0 2px ${alpha(YELLOW_COMPLEMENTARY, 0.25)}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backdropFilter: `blur(${BLUR_AMOUNT})`,
            WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 12,
            transition: `all ${ANIMATION_DURATION} ease-out`,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(YELLOW_COMPLEMENTARY, 0.5),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: YELLOW_COMPLEMENTARY,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          border: BORDER_LIGHT,
          transition: `all ${ANIMATION_DURATION} ease-out`,
        },
        filled: {
          backgroundColor: alpha(YELLOW_COMPLEMENTARY, 0.2),
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: YELLOW_COMPLEMENTARY,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 26 / 2,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          opacity: 1,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 100,
          padding: 4,
          border: BORDER_LIGHT,
        },
        indicator: {
          backgroundColor: YELLOW_COMPLEMENTARY,
          borderRadius: 100,
          height: '100%',
          zIndex: -1,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: 'rgba(0, 0, 0, 0.7)',
          minWidth: 100,
          borderRadius: 100,
          '&.Mui-selected': {
            color: '#fff',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          borderRadius: 8,
          fontWeight: 400,
          padding: '6px 12px',
        },
      },
    },
  },
});

// Dark mode version
export const glassmorphicDarkTheme = createTheme({
  ...glassmorphicTheme,
  palette: {
    ...glassmorphicTheme.palette,
    mode: 'dark',
    background: {
      default: 'rgba(30, 30, 30, 0.5)',
      paper: 'rgba(30, 30, 30, 0.8)',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.6)',
    },
  },
  components: {
    ...glassmorphicTheme.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          border: BORDER_DARK,
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          border: BORDER_DARK,
          backdropFilter: `blur(${BLUR_AMOUNT})`,
          WebkitBackdropFilter: `blur(${BLUR_AMOUNT})`,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          borderRight: BORDER_DARK,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          borderBottom: BORDER_DARK,
          color: 'rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});