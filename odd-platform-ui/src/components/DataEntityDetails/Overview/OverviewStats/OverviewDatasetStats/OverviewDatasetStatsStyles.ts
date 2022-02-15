import { Typography } from '@mui/material';
import styled from 'styled-components';

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.hint,
  textTransform: 'uppercase',
}));
