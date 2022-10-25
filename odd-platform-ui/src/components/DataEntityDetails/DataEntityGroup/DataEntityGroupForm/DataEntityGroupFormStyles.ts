import { Grid } from '@mui/material';
import styled from 'styled-components';

export const EntityItemsContainer = styled(Grid)(({ theme }) => ({
  '& > *': {
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
  },
  '& > *:last-child': { borderBottom: 'none' },
}));
