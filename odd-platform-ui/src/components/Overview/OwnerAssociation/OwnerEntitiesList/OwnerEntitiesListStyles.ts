import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(4),
}));

export const DataEntityContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  // Pack the Recommended columns from the left and wrap — `space-between` stranded the two
  // always-on columns (Favorites + Popular) at opposite edges; `flex-start` groups them, and
  // `wrap` keeps the owner columns (My Objects / Upstream / Downstream) tidy when they're added.
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  rowGap: theme.spacing(2),
  '& > *': { marginRight: theme.spacing(1.5) },
  '& > :last-child': { marginRight: theme.spacing(0) },
}));
