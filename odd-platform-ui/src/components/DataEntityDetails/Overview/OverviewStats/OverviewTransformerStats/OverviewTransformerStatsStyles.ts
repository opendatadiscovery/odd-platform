import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StatIconContainer = styled('div')(({ theme }) => ({
  fontSize: theme.typography.h5.fontSize,
  color: theme.palette.button?.primaryLight.normal.color,
}));

export const EntityLink = styled(Link)(() => ({
  textAlign: 'left',
  wordBreak: 'break-all',
}));
