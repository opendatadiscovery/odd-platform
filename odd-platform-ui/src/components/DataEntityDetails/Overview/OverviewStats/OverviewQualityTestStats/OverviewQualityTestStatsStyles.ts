import { Grid } from '@mui/material';
import styled from 'styled-components';

export const StatsContainer = styled(Grid)(({ theme }) => ({
  alignItems: 'flex-start',
  flexWrap: 'nowrap',
  columnGap: theme.spacing(4),
}));

export const Overview = styled(Grid)(({ theme }) => ({
  '& > *': {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(0.25),
    '&:last-child': { marginLeft: 0 },
  },
}));
