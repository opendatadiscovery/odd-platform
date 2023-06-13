import styled from 'styled-components';
import { Box } from '@mui/material';
import type { CSSProperties } from 'react';

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.border.primary,
  padding: theme.spacing(0, 0.25, 0, 0),
}));

export const Cell = styled('div')<{ $flex: CSSProperties['flex'] }>(
  ({ theme, $flex }) => ({
    display: 'flex',
    flex: $flex,
    alignItems: 'center',
    overflow: 'hidden',
    padding: theme.spacing(0, 1),
  })
);

export const RowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.25, 0),
  justifyContent: 'space-between',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.border.primary,
  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
}));
