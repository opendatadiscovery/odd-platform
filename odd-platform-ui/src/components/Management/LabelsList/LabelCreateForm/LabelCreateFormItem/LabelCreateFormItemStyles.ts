import { Box } from '@mui/material';
import styled from 'styled-components';

export const LabelItemButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingBottom: theme.spacing(0.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
}));
