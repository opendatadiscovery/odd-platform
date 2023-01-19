import { Typography, type TypographyProps } from '@mui/material';
import styled from 'styled-components';

export const TruncatedList = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex !important',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(0.5),
  '& > *': { margin: theme.spacing(0.25, 0.25) },
}));

export const LinkContent = styled(Typography)<TypographyProps>(() => ({
  borderRadius: 'inherit',
  letterSpacing: 'inherit',
  fontWeight: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
}));
