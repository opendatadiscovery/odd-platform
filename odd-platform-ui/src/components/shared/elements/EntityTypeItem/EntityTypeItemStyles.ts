import styled from 'styled-components';
import { Typography } from '@mui/material';

export const Content = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  padding: theme.spacing(0.25, 0.5),
  borderRadius: '4px',
  backgroundColor: theme.palette.backgrounds.primary,
  whiteSpace: 'nowrap',
}));
