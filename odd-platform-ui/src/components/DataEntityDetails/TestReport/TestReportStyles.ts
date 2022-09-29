import { Grid } from '@mui/material';
import styled from 'styled-components';

export const TestReportContainer = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  '& > *': { marginRight: theme.spacing(2) },
}));

export const TestReportItemCont = styled(Grid)(({ theme }) => ({
  '& + $testReportItemContainer': { marginTop: theme.spacing(2) },
  '& > *': { padding: theme.spacing(0.75, 1) },
  '& > * + *': {
    borderTop: '1px solid',
    borderTopColor: theme.palette.divider,
  },
}));
