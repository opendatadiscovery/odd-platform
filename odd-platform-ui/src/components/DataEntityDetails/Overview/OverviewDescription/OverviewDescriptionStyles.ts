import styled from 'styled-components';
import { Grid } from '@mui/material';

export const CaptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

export const ExternalContainer = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const CollapseContainer = styled(Grid)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const FormActions = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));
