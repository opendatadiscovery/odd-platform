import styled from 'styled-components';
import { Grid } from '@mui/material';

interface Active {
  $active: boolean;
}

export const SlackButtonContainer = styled(Grid)<Active>(({ $active }) => ({
  opacity: $active ? 1 : 0,
}));

export const Container = styled(Grid)<Active>(({ theme, $active }) => ({
  backgroundColor: $active ? theme.palette.backgrounds.primary : 'inherit',
  borderRadius: theme.spacing(1),
  border: `1px solid`,
  borderColor: $active ? theme.palette.border.element : theme.palette.border.primary,
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.25, 0),
  flexDirection: 'column',
  alignItems: 'center',
  '&:hover': { cursor: 'pointer' },
}));
