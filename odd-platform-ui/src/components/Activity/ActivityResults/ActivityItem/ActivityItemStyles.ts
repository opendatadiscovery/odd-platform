import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  padding: theme.spacing(2),
  flexDirection: 'column',
}));
