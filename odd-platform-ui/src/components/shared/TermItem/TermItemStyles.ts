import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ActionsContainer = styled(Grid)(() => ({
  opacity: 0,
}));

export const TermItemContainer = styled(Link)(({ theme }) => ({
  display: 'flex',
  borderRadius: '4px',
  padding: theme.spacing(0.25, 1),
  '&:hover, &:active': {
    cursor: 'pointer',
    background: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
