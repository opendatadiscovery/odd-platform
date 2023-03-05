import styled from 'styled-components';
import { Box } from '@mui/material';
import { Link, type LinkProps } from 'react-router-dom';

export const StatIconContainer = styled(Box)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  color: theme.palette.button?.primaryLight.normal.color,
  display: 'flex',
  alignSelf: 'center',
}));

export const EntityLink = styled(Link)<LinkProps>(() => ({
  width: 'inherit',
}));

export const TruncatedText = styled('div')(() => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));
