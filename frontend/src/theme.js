import { createTheme } from '@mui/material';

// GenBI brand colors
const colors = {
  primary: {
    main: '#2563EB', // Professional blue
    light: '#60A5FA',
    dark: '#1E40AF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#7C3AED', // Purple for accents
    light: '#A78BFA',
    dark: '#5B21B6',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // Green for success states
    light: '#34D399',
    dark: '#059669',
  },
  error: {
    main: '#EF4444', // Red for errors
    light: '#F87171',
    dark: '#B91C1C',
  },
  warning: {
    main: '#F59E0B', // Amber for warnings
    light: '#FBBF24',
    dark: '#D97706',
  },
  info: {
    main: '#3B82F6', // Blue for info
    light: '#60A5FA',
    dark: '#2563EB',
  },
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
    dark: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
  divider: '#E5E7EB',
};

// Create the theme
const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 1px 5px rgba(0, 0, 0, 0.05), 0px 1px 8px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 6px rgba(0, 0, 0, 0.08)',
    '0px 4px 8px rgba(0, 0, 0, 0.04), 0px 6px 12px rgba(0, 0, 0, 0.08)',
    '0px 5px 15px rgba(0, 0, 0, 0.08)',
    '0px 6px 18px rgba(0, 0, 0, 0.08)',
    '0px 7px 21px rgba(0, 0, 0, 0.08)',
    '0px 8px 24px rgba(0, 0, 0, 0.08)',
    '0px 9px 27px rgba(0, 0, 0, 0.08)',
    '0px 10px 30px rgba(0, 0, 0, 0.08)',
    '0px 11px 33px rgba(0, 0, 0, 0.08)',
    '0px 12px 36px rgba(0, 0, 0, 0.08)',
    '0px 13px 39px rgba(0, 0, 0, 0.08)',
    '0px 14px 42px rgba(0, 0, 0, 0.08)',
    '0px 15px 45px rgba(0, 0, 0, 0.08)',
    '0px 16px 48px rgba(0, 0, 0, 0.08)',
    '0px 17px 51px rgba(0, 0, 0, 0.08)',
    '0px 18px 54px rgba(0, 0, 0, 0.08)',
    '0px 19px 57px rgba(0, 0, 0, 0.08)',
    '0px 20px 60px rgba(0, 0, 0, 0.08)',
    '0px 21px 63px rgba(0, 0, 0, 0.08)',
    '0px 22px 66px rgba(0, 0, 0, 0.08)',
    '0px 23px 69px rgba(0, 0, 0, 0.08)',
    '0px 24px 72px rgba(0, 0, 0, 0.08)',
  ],
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: colors.text.primary,
          borderBottom: `1px solid ${colors.divider}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: 16,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.05), 0px 1px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 6px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.dark,
          '& .MuiTableCell-root': {
            color: colors.text.primary,
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.divider}`,
          padding: '16px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundColor: colors.background.paper,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 16px',
          '&.Mui-selected': {
            backgroundColor: colors.primary.light + '20',
            color: colors.primary.main,
            '&:hover': {
              backgroundColor: colors.primary.light + '30',
            },
            '& .MuiListItemIcon-root': {
              color: colors.primary.main,
            },
          },
        },
      },
    },
  },
});

export default theme;
