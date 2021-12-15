import { styled } from '@mui/material/styles';

export const StatIconContainer = styled('div')(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  color: theme.palette.button?.primaryLight.normal.color,
}));
