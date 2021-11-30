import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  width: '269px',
  minHeight: '255px',
  maxHeight: '400px',
  overflowY: 'hidden',
}));

export const AboutContainer = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(2),
}));

export const AboutText = styled(Typography)(() => ({
  width: '100%',
}));
