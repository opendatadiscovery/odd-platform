import styled from 'styled-components';
import { Box, Grid } from '@mui/material';

export const Icon = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.backgrounds.primary,
  marginRight: theme.spacing(2),
}));

export const MenuItem = styled(Grid)(({ theme }) => ({
  minWidth: '300px',
  padding: theme.spacing(1.25, 1),
  borderRadius: theme.spacing(0.5),
  alignItems: 'center',
  flexWrap: 'nowrap',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${Icon}`]: { backgroundColor: theme.palette.backgrounds.secondary },
  },
  '&:active': {
    backgroundColor: theme.palette.backgrounds.secondary,
    [`${Icon}`]: { backgroundColor: theme.palette.backgrounds.primary },
  },
}));
