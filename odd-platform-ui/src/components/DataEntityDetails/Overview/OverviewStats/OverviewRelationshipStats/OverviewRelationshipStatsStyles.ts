import styled from 'styled-components';
import { Box } from '@mui/material';

export const StatIconContainer = styled(Box)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  color: theme.palette.texts.action,
}));

export const Tooltip = styled('div')(({ theme }) => ({
  fontSize: '14px',
  padding: theme.spacing(1),
  maxWidth: '430px',
  border: '1px solid',
  borderRadius: '8px',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));
