import { Grid } from '@mui/material';
import AppPaper from 'components/shared/elements/AppPaper/AppPaper';
import styled from 'styled-components';

export const CollectorActionsContainer = styled(Grid)(() => ({
  opacity: 0,
  display: 'flex',
  justifyContent: 'flex-end',
}));

export const CollectorDescriptionContainer = styled(Grid)(({ theme }) => ({
  '& > *': {
    marginBottom: theme.spacing(1),
  },
  '& > *:last-child': {
    marginBottom: theme.spacing(0),
  },
}));

export const CollectorContainer = styled(AppPaper)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2, 2, 2, 2),
  margin: '0 auto',
  alignItems: 'flex-start',
  '&:hover': {
    boxShadow: theme.shadows[8],
    [`${CollectorActionsContainer}`]: { opacity: 1 },
  },
}));
