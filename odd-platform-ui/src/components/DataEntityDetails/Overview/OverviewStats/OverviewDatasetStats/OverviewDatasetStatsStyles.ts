import { Grid, Typography } from '@mui/material';

import { styled } from '@mui/material/styles';

export const StatsItem = styled(Grid)(() => ({
  display: 'flex',
  alignItems: 'center',
}));
export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.hint,
  textTransform: 'uppercase',
}));
