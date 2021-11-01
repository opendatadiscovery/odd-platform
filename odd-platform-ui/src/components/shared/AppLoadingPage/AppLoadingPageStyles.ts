import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'center',
  overflow: 'auto',
}));
