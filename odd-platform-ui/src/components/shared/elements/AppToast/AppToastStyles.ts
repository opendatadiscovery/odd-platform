import styled from 'styled-components';
import { Box } from '@mui/material';
import { type ToastType } from 'react-hot-toast';

export const Container = styled(Box)<{ $type: ToastType }>(({ theme, $type }) => ({
  width: '320px',
  display: 'flex',
  flexWrap: 'nowrap',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.toast[$type],
  borderRadius: theme.spacing(0.25),
  boxShadow: theme.shadows[8],
}));
