import { Typography, TypographyProps } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Typography)<
  {
    $unfilled?: boolean;
    component: React.ElementType;
  } & TypographyProps
>(({ theme, $unfilled }) => ({
  margin: theme.spacing(0.25),
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.palette.texts.info,
  backgroundColor:
    theme.palette.backgrounds[$unfilled ? 'default' : 'secondary'],
  borderRadius: $unfilled ? '4px' : '2px',
  border: $unfilled ? '1px solid' : '',
  borderColor: theme.palette.divider,
  padding: $unfilled
    ? theme.spacing(0.25, 0.5, 0.25, 1)
    : theme.spacing(0, 0.25),
}));
