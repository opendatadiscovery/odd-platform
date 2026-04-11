import { Grid } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.backgrounds.primary,
  borderRadius: '2px',
  padding: theme.spacing(0, 0.5, 0, 0.5),
  margin: theme.spacing(0.5, 0.25, 0, 0.25),
  maxWidth: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': { backgroundColor: theme.palette.backgrounds.secondary },
}));
