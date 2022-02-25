import { CssBaseline } from '@mui/material';
import styled from 'styled-components';

export const AppCssBaseline = styled(CssBaseline)(() => ({
  '@global': {
    'a:-webkit-any-link': {
      font: 'inherit',
      color: 'inherit',
      textDecoration: 'inherit',
    },
  },
}));
