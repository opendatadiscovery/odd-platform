import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignContent: 'flex-start',
  height: 'calc(100vh - 251px)',
  width: '100%',
  overflowY: 'auto',
  padding: theme.spacing(2),
}));
