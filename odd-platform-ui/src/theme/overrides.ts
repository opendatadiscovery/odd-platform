import { Components } from '@mui/material';

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
      a: {
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'inherit',
      },
    },
  },
};
