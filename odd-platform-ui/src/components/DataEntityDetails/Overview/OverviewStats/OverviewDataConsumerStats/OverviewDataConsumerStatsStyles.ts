import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.hint,
}));
