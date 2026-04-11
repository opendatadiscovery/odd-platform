import { Grid } from '@mui/material';
import styled from 'styled-components';

export const ActionsContainer = styled(Grid)(() => ({
  justifyContent: 'flex-end',
  opacity: 0,
}));

export const Container = styled(Grid)(({ theme }) => ({
  alignItems: 'center',
  padding: theme.spacing(1.5, 1, 1.5, 1),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  flexWrap: 'nowrap',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
