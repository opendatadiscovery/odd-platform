import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

export const StatCellContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1, 2),
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:last-child': { borderRadius: theme.spacing(1) },
}));
