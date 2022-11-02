import { Grid } from '@mui/material';
import styled from 'styled-components';

export const Caption = styled(Grid)(() => ({
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const TableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': { padding: theme.spacing(0, 1) },
}));

export const Col = styled(Grid)(() => ({
  minWidth: '285px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
}));
