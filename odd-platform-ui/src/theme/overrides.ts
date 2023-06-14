import type { Components } from '@mui/material';

export const components: Components = {
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
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        '*::-webkit-scrollbar': { width: '4px' },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#EBECF0',
          borderRadius: '2px',
          '&:hover': { backgroundColor: '#C1C7D0' },
        },
      },
      a: {
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'inherit',
      },
      button: {
        padding: 0,
      },
    },
  },
};
