import { Grid } from '@mui/material';
import styled from 'styled-components';

export const TestReportBySuitNameHeader = styled(Grid)(({ theme }) => ({
  cursor: 'pointer',
  flexWrap: 'nowrap',
  paddingBottom: theme.spacing(0.75),
}));
