import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  width: '640px',
  // minHeight: '255px',
  maxHeight: '510px',
  overflowY: 'hidden',
}));

export const HighlightText = styled(Typography)(({ theme }) => ({
  overflowX: 'hidden',
  textOverflow: 'ellipsis',
  '& > b': { backgroundColor: theme.palette.warning.light, fontWeight: 400 },
}));

export const AboutContainer = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(2),
}));

export const AboutText = styled(Typography)(() => ({ width: '100%' }));
