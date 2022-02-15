import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

export const StatsContainer = styled(Grid)(() => ({
  justifyContent: 'space-between',
  '& > *': {
    flex: '0 0 278px',
  },
}));

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.secondary,
  lineHeight: theme.typography.h2.lineHeight,
}));

export const Overview = styled(Grid)(({ theme }) => ({
  '& > *': {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(0.25),
    '&:last-child': { marginLeft: 0 },
  },
}));
