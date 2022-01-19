import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const TypeLabel = styled(Grid)(({ theme }) => ({
  marginLeft: 0,
  marginBottom: theme.spacing(1.25),
}));

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.hint,
  marginLeft: theme.spacing(0.5),
}));

export const UnknownCount = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
}));
