import { Typography } from '@mui/material';
import styled from 'styled-components';

export const TermItemContainer = styled(Typography)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRadius: '4px',
  padding: theme.spacing(0.25, 1),
  color: theme.palette.texts.action,
  '&:hover, &:active': {
    cursor: 'pointer',
    background: theme.palette.backgrounds.primary,
  },
}));
