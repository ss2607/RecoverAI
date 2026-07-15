import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      soft: string;
      card: string;
      dialog: string;
      button: string;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      soft?: string;
      card?: string;
      dialog?: string;
      button?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    background: {
      default: '#F7F3EE', // soft beige
      paper: '#FFFCF8', // cream surface
    },
    primary: {
      main: '#B88A5A',
      contrastText: '#FFFCF8',
    },
    secondary: {
      main: '#7B5B3D',
      contrastText: '#FFFCF8',
    },
    text: {
      primary: '#2B2B2B',
      secondary: '#6F6F6F',
    },
    info: {
      main: '#D8C3A5', // accent
      contrastText: '#2B2B2B',
    },
    success: {
      main: '#4F8A5B',
      contrastText: '#FFFCF8',
    },
    warning: {
      main: '#D59B3A',
      contrastText: '#FFFCF8',
    },
    error: {
      main: '#B24C4C',
      contrastText: '#FFFCF8',
    },
    divider: '#E7DDD1', // border color
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#2B2B2B',
    },
    h2: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 750,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
      color: '#2B2B2B',
    },
    h3: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: '#2B2B2B',
    },
    h4: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#2B2B2B',
    },
    h5: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 650,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#2B2B2B',
    },
    h6: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.4,
      color: '#2B2B2B',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#2B2B2B',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6F6F6F',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2B2B2B',
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6F6F6F',
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  customShadows: {
    soft: '0 2px 12px rgba(123, 91, 61, 0.04)',
    card: '0 8px 30px rgba(123, 91, 61, 0.06)',
    dialog: '0 20px 50px rgba(123, 91, 61, 0.12)',
    button: '0 4px 14px rgba(184, 138, 90, 0.2)',
  },
  shape: {
    borderRadius: 14, // default base border radius
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F7F3EE',
          color: '#2B2B2B',
          fontFamily: '"Inter", sans-serif',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F7F3EE',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#D8C3A5',
            borderRadius: '8px',
          },
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: false,
      },
      styleOverrides: {
        root: {
          maxWidth: '1400px !important', // Maximum content width as requested
          paddingLeft: '24px',
          paddingRight: '24px',
          '@media (min-width: 600px)': {
            paddingLeft: '40px',
            paddingRight: '40px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFCF8',
          backgroundImage: 'none',
          borderRadius: 18,
          boxShadow: '0 8px 30px rgba(123, 91, 61, 0.06)',
          border: '1px solid #E7DDD1',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundColor: '#FFFCF8',
          border: '1px solid #E7DDD1',
          boxShadow: '0 8px 30px rgba(123, 91, 61, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 36px rgba(123, 91, 61, 0.1)',
            borderColor: '#B88A5A',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 4px 14px rgba(184, 138, 90, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: '#B88A5A',
          color: '#FFFCF8',
          border: '1px solid rgba(184, 138, 90, 0.1)',
          '&:hover': {
            backgroundColor: '#7B5B3D',
            borderColor: 'rgba(123, 91, 61, 0.1)',
          },
        },
        containedSecondary: {
          backgroundColor: '#7B5B3D',
          color: '#FFFCF8',
          '&:hover': {
            backgroundColor: '#5C442D',
          },
        },
        outlinedPrimary: {
          borderColor: '#E7DDD1',
          color: '#7B5B3D',
          '&:hover': {
            borderColor: '#B88A5A',
            backgroundColor: 'rgba(184, 138, 90, 0.04)',
          },
        },
        textPrimary: {
          color: '#7B5B3D',
          '&:hover': {
            backgroundColor: 'rgba(123, 91, 61, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            backgroundColor: '#FFFCF8',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#E7DDD1',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: '#D8C3A5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#B88A5A',
              borderWidth: '1px',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(184, 138, 90, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6F6F6F',
            fontFamily: '"Inter", sans-serif',
            fontSize: '0.9rem',
            '&.Mui-focused': {
              color: '#7B5B3D',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          '& fieldset': {
            borderColor: '#E7DDD1',
          },
          '&:hover fieldset': {
            borderColor: '#D8C3A5',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#B88A5A',
            borderWidth: '1px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E7DDD1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D8C3A5',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#B88A5A',
            borderWidth: '1px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 22,
          boxShadow: '0 20px 50px rgba(123, 91, 61, 0.12)',
          border: '1px solid #E7DDD1',
          padding: '12px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 700,
          fontSize: '1.35rem',
          color: '#2B2B2B',
          padding: '16px 24px 8px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px 16px',
          color: '#6F6F6F',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 16px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 700,
            color: '#2B2B2B',
            backgroundColor: '#FFFCF8',
            borderBottom: '2px solid #E7DDD1',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          borderBottom: '1px solid #E7DDD1',
          fontFamily: '"Inter", sans-serif',
          color: '#6F6F6F',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFCF8',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(231, 221, 209, 0.25) !important',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          fontSize: '0.75rem',
          height: '26px',
        },
        colorPrimary: {
          backgroundColor: 'rgba(184, 138, 90, 0.1)',
          color: '#7B5B3D',
          border: '1px solid rgba(184, 138, 90, 0.2)',
        },
        colorSecondary: {
          backgroundColor: 'rgba(123, 91, 61, 0.1)',
          color: '#7B5B3D',
          border: '1px solid rgba(123, 91, 61, 0.2)',
        },
        colorSuccess: {
          backgroundColor: 'rgba(79, 138, 91, 0.08)',
          color: '#4F8A5B',
          border: '1px solid rgba(79, 138, 91, 0.15)',
        },
        colorWarning: {
          backgroundColor: 'rgba(213, 155, 58, 0.08)',
          color: '#D59B3A',
          border: '1px solid rgba(213, 155, 58, 0.15)',
        },
        colorError: {
          backgroundColor: 'rgba(178, 76, 76, 0.08)',
          color: '#B24C4C',
          border: '1px solid rgba(178, 76, 76, 0.15)',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: '0.7rem',
          fontWeight: 700,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFCF8',
          color: '#2B2B2B',
          border: '1px solid #E7DDD1',
          borderRadius: 14,
          boxShadow: '0 8px 30px rgba(123, 91, 61, 0.06)',
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#7B5B3D',
          color: '#FFFCF8',
          fontSize: '0.75rem',
          borderRadius: 8,
          padding: '6px 10px',
        },
      },
    },
  },
});
