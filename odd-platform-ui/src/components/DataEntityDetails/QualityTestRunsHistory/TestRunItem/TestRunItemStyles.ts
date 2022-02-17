import { Grid } from '@mui/material';
import styled from 'styled-components';

export const StatusReasonModalBtnContainer = styled('div')(() => ({
  opacity: 0,
}));

export const Container = styled(Grid)(({ theme }) => ({
  flexWrap: 'nowrap',
  padding: theme.spacing(1.5, 0),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    [`${StatusReasonModalBtnContainer}`]: { opacity: 1 },
  },
}));
