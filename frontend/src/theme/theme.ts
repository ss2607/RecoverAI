import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    background: {
      default: '#F5EFE6', // soft warm beige
      paper: '#FFFDF8', // very warm cream
    },
    primary: {
      main: '#C6A27E', // warm taupe / luxury beige
      contrastText: '#FFFDF8',
    },
    secondary: {
      main: '#8B6F47', // muted warm brown
      contrastText: '#FFFDF8',
    },
    text: {
      primary: '#2F2F2F', // charcoal
      secondary: '#6E6E6E', // soft grey
    },
    info: {
      main: '#D8C3A5', // light warm sand
    },
    divider: 'rgba(139, 111, 71, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      color: '#2F2F2F',
    },
    h2: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: '#2F2F2F',
    },
    h3: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 750,
      letterSpacing: '-0.01em',
      color: '#2F2F2F',
    },
    h4: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
      color: '#2F2F2F',
    },
    h5: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
      color: '#2F2F2F',
    },
    h6: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
      color: '#2F2F2F',
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    body1: {
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    body2: {
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5EFE6',
          color: '#2F2F2F',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F5EFE6',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D8C3A5',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(139, 111, 71, 0.1)',
            transform: 'translateY(-1.5px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: '#C6A27E',
          color: '#FFFDF8',
          border: '1px solid rgba(139, 111, 71, 0.1)',
          '&:hover': {
            backgroundColor: '#8B6F47',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(198, 162, 126, 0.4)',
          color: '#8B6F47',
          '&:hover': {
            borderColor: '#8B6F47',
            backgroundColor: 'rgba(198, 162, 126, 0.04)',
          },
        },
        textInherit: {
          color: '#2F2F2F',
          '&:hover': {
            backgroundColor: 'rgba(47, 47, 47, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(255, 253, 248, 0.75)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(139, 111, 71, 0.03)',
          border: '1px solid rgba(139, 111, 71, 0.09)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(139, 111, 71, 0.08)',
            borderColor: 'rgba(198, 162, 126, 0.35)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 253, 248, 0.8)',
          backdropFilter: 'blur(16px)',
          color: '#2F2F2F',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(139, 111, 71, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '& fieldset': {
              borderColor: 'rgba(139, 111, 71, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(139, 111, 71, 0.35)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#C6A27E',
              borderWidth: '1.5px',
              boxShadow: '0 0 0 3px rgba(198, 162, 126, 0.15)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
        colorPrimary: {
          backgroundColor: 'rgba(198, 162, 126, 0.1)',
          color: '#8B6F47',
          border: '1px solid rgba(198, 162, 126, 0.2)',
        },
        colorSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.08)',
          color: '#2e7d32',
          border: '1px solid rgba(76, 175, 80, 0.15)',
        },
        colorError: {
          backgroundColor: 'rgba(211, 47, 47, 0.06)',
          color: '#d32f2f',
          border: '1px solid rgba(211, 47, 47, 0.1)',
        },
      },
    },
  },
});
