import styled from 'styled-components';
import { Grid } from '@mui/material';

export const SubtitleContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

export const PredefinedContainer = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

export const CollapseContainer = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
}));
