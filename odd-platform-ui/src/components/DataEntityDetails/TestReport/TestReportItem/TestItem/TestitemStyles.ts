import { Grid } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)<{ $active: boolean }>(({ theme, $active }) => ({
  flexWrap: 'nowrap',
  padding: theme.spacing(0.75, 1),
  alignItems: 'center',
  borderRadius: '4px',
  backgroundColor: $active ? theme.palette.backgrounds.secondary : 'inherit',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds[$active ? 'secondary' : 'primary'],
  },
}));
