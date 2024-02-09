import { Grid } from '@mui/material';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 1, 1.5, 1),
}));

export const FacetsLoaderContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  justifyContent: 'center',
}));

export const ListContainer = styled('div')(() => ({
  margin: '16px 0',
}));
