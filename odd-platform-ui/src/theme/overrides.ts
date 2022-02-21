import { Components } from '@mui/material';

export const components: Components = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
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
  MuiLink: {
    styleOverrides: {
      root: {
        textUnderlineOffset: '3px',
      },
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
