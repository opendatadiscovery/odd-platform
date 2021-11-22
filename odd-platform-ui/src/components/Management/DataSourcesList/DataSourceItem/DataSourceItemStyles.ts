import { Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ActionsContainer = styled(Grid)(({ theme }) => ({
  visibility: 'hidden',
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
  width: 'calc(100% - 8px)',
  padding: theme.spacing(2, 2, 2, 2),
  margin: '0 auto',
  alignItems: 'flex-start',
  // '&:hover': {
  //   boxShadow: theme.shadows[8],
  //   [`${ActionsContainer}`]: { visibility: 'visible' },
  // },
}));
