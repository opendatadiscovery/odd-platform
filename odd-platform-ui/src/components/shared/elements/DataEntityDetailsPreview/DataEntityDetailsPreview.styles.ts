import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  minWidth: '400px',
  width: 'min-content',
  maxWidth: '800px',
  minHeight: '255px',
  height: 'fit-content',
  maxHeight: '50vh',
  overflowY: 'hidden',
  border: '1px solid',
  borderRadius: '8px',
  justifyContent: 'flex-start',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));

export const BlockContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderBottom: '1px solid',
  borderColor: theme.palette.border.primary,
}));

export const AboutContainer = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(2),
}));

export const AboutText = styled(Typography)(() => ({ width: '100%' }));
