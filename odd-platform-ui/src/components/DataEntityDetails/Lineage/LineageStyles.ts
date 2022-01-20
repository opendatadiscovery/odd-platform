import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled(Grid)(() => ({
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));
