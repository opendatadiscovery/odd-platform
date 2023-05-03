import styled from 'styled-components';
import { Grid } from '@mui/material';

export const CollapseFooter = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
}));
