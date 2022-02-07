import styled from 'styled-components';
import { Grid } from '@mui/material';

export const ListItemContainer = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  minHeight: '40px',
  justifyContent: 'space-between',
  padding: theme.spacing(1.25, 1),
  flexWrap: 'nowrap',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
  },
}));

export const ListItemTypesContainer = styled(Grid)(() => ({
  justifyContent: 'flex-end',
  flexBasis: '20%',
}));
