import styled from 'styled-components';
import { Grid } from '@mui/material';

export const StatsContainer = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  paddingBottom: theme.spacing(1),
}));

export const StatusReasonContainer = styled(Grid)(() => ({
  maxHeight: '70vh',
}));
