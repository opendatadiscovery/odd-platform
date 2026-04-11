import styled from 'styled-components';
import { Box } from '@mui/material';

export const StatIconContainer = styled(Box)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  color: theme.palette.texts.action,
}));
