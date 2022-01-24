import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const TestReportBySuitNameHeader = styled(Grid)(({ theme }) => ({
  cursor: 'pointer',
  flexWrap: 'nowrap',
  paddingBottom: theme.spacing(0.75),
}));
