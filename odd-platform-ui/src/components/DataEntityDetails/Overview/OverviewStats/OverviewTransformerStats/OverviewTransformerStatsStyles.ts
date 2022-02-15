import styled from 'styled-components';
import { Link, LinkProps } from 'react-router-dom';
import { Box } from '@mui/material';

export const StatIconContainer = styled(Box)(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  color: theme.palette.button?.primaryLight.normal.color,
}));

export const EntityLink = styled(Link)<LinkProps>(() => ({
  textAlign: 'left',
  wordBreak: 'break-all',
}));
