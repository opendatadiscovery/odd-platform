import { Grid } from '@mui/material';
import AppPaper from 'components/shared/elements/AppPaper/AppPaper';
import styled from 'styled-components';

export const ActionsContainer = styled(Grid)(() => ({
  opacity: 0,
  display: 'flex',
  justifyContent: 'flex-end',
}));

export const DescriptionContainer = styled(Grid)(({ theme }) => ({
  paddingLeft: theme.spacing(7),
  '& > *': { marginBottom: theme.spacing(1) },
  '& > *:last-child': { marginBottom: theme.spacing(0) },
}));

export const Container = styled(AppPaper)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  padding: theme.spacing(2),
  alignItems: 'flex-start',
  '&:hover': {
    boxShadow: theme.shadows[8],
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
