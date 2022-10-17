import { Grid } from '@mui/material';
import styled from 'styled-components';

export const ActionsContainer = styled(Grid)(() => ({
  justifyContent: 'flex-end',
  opacity: 0,
}));

export const Container = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  '& > *': {
    padding: theme.spacing(0, 1),
    '&:last-child': { paddingLeft: 0 },
  },

  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
