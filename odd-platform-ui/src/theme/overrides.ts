import { Components } from '@mui/material';

export const components: Components = {
  MuiButtonBase: {
    defaultProps: {
      disableTouchRipple: true,
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      endAdornment: { top: 'calc(50% - 12px)' },
      clearIndicator: {
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#42526E',
        },
      },
      popupIndicator: {
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#42526E',
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paperWidthXs: { maxWidth: '368px' },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        padding: '24px 24px 0 24px',
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '14px 24px 28px 24px',
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '0px 24px 24px 24px',
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: '#B3BAC5',
      },
      colorSecondary: {
        '&:hover': {
          backgroundColor: 'unset',
        },
        '&$checked:hover': {
          backgroundColor: 'unset !important',
        },
        '&$checked': {
          color: '#0080FF',
        },
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        color: '#B3BAC5',
      },
      colorSecondary: {
        '&:hover': {
          backgroundColor: 'unset',
        },
        '&$checked:hover': {
          backgroundColor: 'unset !important',
        },
        '&$checked': {
          color: '#0080FF',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '.9rem',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      flexContainer: { alignItems: 'center' },
      scrollButtons: {
        width: '20px',
        '&.Mui-disabled': {
          opacity: 0.2,
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: '32px',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        textUnderlineOffset: '3px',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: { fontSize: '14px', lineHeight: '20px' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        border: ' 1px solid #EBECF0',
        borderRadius: '4px',
      },
      elevation9: {
        borderRadius: '8px',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: { padding: '12px 8px' },
    },
  },
  MuiList: {
    styleOverrides: {
      padding: { paddingTop: 0, paddingBottom: 0 },
      root: {
        '& > option': {
          cursor: 'pointer',
          height: '24px',
          padding: '4px 8px',
          '&:hover': {
            backgroundColor: '#F4F5F7',
          },
          '&:active': {
            backgroundColor: '#EBECF0',
          },
        },
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      'a:-webkit-any-link': {
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'inherit',
      },
    },
  },
};
