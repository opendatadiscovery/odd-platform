import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignContent: 'flex-start',
  height: 'calc(100vh - 251px)',
  width: '100%',
  overflowY: 'auto',
  padding: theme.spacing(2),
}));

export const SectionContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'column',
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));
