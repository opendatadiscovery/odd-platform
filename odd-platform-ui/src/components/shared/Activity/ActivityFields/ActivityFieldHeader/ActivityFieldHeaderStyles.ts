import { Grid } from '@mui/material';
import styled from 'styled-components';

export const FieldHeader = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  alignItems: 'center',
  marginTop: theme.spacing(0.75),
  '& > *': { marginRight: theme.spacing(0.25) },
}));
