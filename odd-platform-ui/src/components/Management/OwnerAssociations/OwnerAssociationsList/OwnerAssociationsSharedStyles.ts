import { Grid } from '@mui/material';
import styled from 'styled-components';

export const TableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  marginTop: theme.spacing(1.5),
  '& > *': {
    padding: theme.spacing(0, 1),
  },
}));

export const AssociationsItemActionsContainer = styled(Grid)(() => ({
  justifyContent: 'flex-end',
  opacity: 0,
}));

export const AssociationsItemContainer = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  alignItems: 'center',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': {
    padding: theme.spacing(1.25, 1, 1.25, 1),
  },
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${AssociationsItemActionsContainer}`]: { opacity: 1 },
  },
}));
