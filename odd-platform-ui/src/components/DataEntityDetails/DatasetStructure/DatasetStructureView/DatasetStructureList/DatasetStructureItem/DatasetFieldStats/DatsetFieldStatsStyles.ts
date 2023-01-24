import styled from 'styled-components';
import { Grid } from '@mui/material';

export const StatCellContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderLeft: `1px solid ${theme.palette.backgrounds.primary} `,
}));
