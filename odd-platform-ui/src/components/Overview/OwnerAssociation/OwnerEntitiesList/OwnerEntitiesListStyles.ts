import styled from 'styled-components';
import { Grid } from '@mui/material';

export const DataEntityContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3.5),
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  '& > *': { marginRight: theme.spacing(1.5) },
  '& > :last-child': { marginRight: theme.spacing(0) },
}));
