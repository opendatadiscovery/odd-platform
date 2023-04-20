import { Typography } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Typography)<{
  $unfilled?: boolean;
  $systemLabel?: boolean;
  component: React.ElementType;
}>(({ theme, $unfilled, $systemLabel }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: $systemLabel ? theme.palette.texts.secondary : theme.palette.texts.info,
  backgroundColor: theme.palette.backgrounds[$unfilled ? 'default' : 'secondary'],
  borderRadius: $unfilled ? '4px' : '2px',
  border: $unfilled ? '1px solid' : '',
  borderColor: theme.palette.divider,
  padding: $unfilled ? theme.spacing(0.25, 0.5, 0.25, 0.5) : theme.spacing(0, 0.5),
}));
