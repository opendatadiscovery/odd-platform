import styled from 'styled-components';
import { Grid } from '@mui/material';

export const MainMessageContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.border.secondary,
}));

export const TextContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'column',
  flexWrap: 'nowrap',
  margin: theme.spacing(1, 0, 1.5, 0),
}));
