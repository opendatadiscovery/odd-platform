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
  cursor: 'pointer',
  '&:hover': {
    background: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
  '&:active': { background: theme.palette.backgrounds.secondary },
}));

export const TermDefinition = styled(Typography)(() => ({
  overflow: 'hidden',
  display: '-webkit-box',
  '-webkit-line-clamp': '2',
  '-webkit-box-orient': 'vertical',
}));
