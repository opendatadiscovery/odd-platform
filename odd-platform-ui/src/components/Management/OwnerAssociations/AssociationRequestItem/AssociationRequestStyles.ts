import { Grid } from '@mui/material';
import styled from 'styled-components';

export const ActionsContainer = styled(Grid)(() => ({
  justifyContent: 'flex-end',
  opacity: 0,
}));

export const Container = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  alignItems: 'center',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': {
    padding: theme.spacing(1.25, 1, 1.25, 1),
  },
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
