import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  backgroundColor: theme.palette.alert.OPEN.color,
  borderRadius: '2px',
  padding: theme.spacing(0.5, 1),
  boxShadow: theme.shadows[1],
}));
