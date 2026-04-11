import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(4),
}));

export const DataEntityContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  '& > *': { marginRight: theme.spacing(1.5) },
  '& > :last-child': { marginRight: theme.spacing(0) },
}));
