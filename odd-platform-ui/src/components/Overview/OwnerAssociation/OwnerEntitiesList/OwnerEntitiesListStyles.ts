import styled from 'styled-components';
import { Grid } from '@mui/material';

export const DataEntityContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(3.5),
  marginLeft: 'auto',
  marginRight: 'auto',
  flexWrap: 'nowrap',
  '& > *': { paddingRight: theme.spacing(1.5) },
  '& > :last-child': { paddingRight: theme.spacing(0) },
}));
