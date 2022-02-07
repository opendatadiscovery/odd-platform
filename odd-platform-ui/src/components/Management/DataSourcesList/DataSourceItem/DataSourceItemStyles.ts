import { Grid, Paper } from '@mui/material';
import styled, { CSSObject } from 'styled-components';

export const ActionsContainer = styled(Grid)(() => ({
  opacity: 0,
  display: 'flex',
  justifyContent: 'flex-end',
}));

export const DescriptionContainer = styled(Grid)(({ theme }) => ({
  '& > *': {
    marginBottom: theme.spacing(1),
  },
  '& > *:last-child': {
    marginBottom: theme.spacing(0),
  },
}));

export const Container = styled(Paper)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2, 2, 2, 2),
  margin: '0 auto',
  alignItems: 'flex-start',
  '&:hover': {
    boxShadow: theme.shadows[8],
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
