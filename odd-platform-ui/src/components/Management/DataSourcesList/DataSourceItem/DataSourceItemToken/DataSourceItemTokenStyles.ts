import { Box } from '@mui/material';
import styled from 'styled-components';

export const TokenContainer = styled(Box)(() => ({
  display: 'inline-flex',
}));

export const Token = styled(Box)<{ $isHidden: boolean }>(({ theme, $isHidden }) => ({
  display: 'inline-flex',
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  color: theme.palette.text.primary,
  borderRadius: theme.spacing(0.5),
  backgroundColor: $isHidden ? 'transparent' : theme.palette.entityClass.DATA_INPUT,
  marginRight: $isHidden ? 0 : theme.spacing(1),
}));
