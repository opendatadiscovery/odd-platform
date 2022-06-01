import { Grid } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  padding: theme.spacing(0.75, 0),
  paddingLeft: theme.spacing(1),
  justifyContent: 'space-between',
}));
