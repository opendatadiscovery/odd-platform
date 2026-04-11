import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  width: '640px',
  flexDirection: 'column',
  rowGap: theme.spacing(1),
}));

export const HighlightText = styled(Typography)(({ theme }) => ({
  '& > b': { backgroundColor: theme.palette.warning.light, fontWeight: 400 },
}));

export const OwnerItem = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0.5),
  borderBottom: '1px solid',
  borderColor: theme.palette.border.primary,
  marginBottom: theme.spacing(0.5),
  '&:last-child': { border: 'none', marginBottom: 0 },
}));

export const StructureItem = styled(Grid)(({ theme }) => ({
  paddingBottom: theme.spacing(0.25),
  borderBottom: '1px solid',
  borderColor: theme.palette.border.primary,
  marginBottom: theme.spacing(0.5),
  '&:last-child': { border: 'none', marginBottom: 0 },
}));
