import { Grid } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ActionsContainer = styled(Grid)(() => ({
  opacity: 0,
}));

export const GroupItemContainer = styled(Link)(({ theme }) => ({
  display: 'flex',
  borderRadius: '4px',
  padding: theme.spacing(0.25, 1),
  cursor: 'pointer',
  '&:hover': {
    background: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
  '&:active': {
    background: theme.palette.backgrounds.secondary,
  },
}));
