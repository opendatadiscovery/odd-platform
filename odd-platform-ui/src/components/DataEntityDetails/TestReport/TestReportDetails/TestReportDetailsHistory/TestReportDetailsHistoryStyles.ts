import { Grid } from '@mui/material';
import styled from 'styled-components';

export const QualityTestRunItemContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
}));

export const QualityTestRunItem = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  padding: theme.spacing(0.75, 1),
  borderRadius: '4px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
  },
}));
