import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled(Typography)<{
  $unfilled?: boolean;
  component: React.ElementType;
}>(({ theme, $unfilled }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.palette.texts.info,
  position: 'relative',
  backgroundColor:
    theme.palette.backgrounds[$unfilled ? 'default' : 'secondary'],
  borderRadius: $unfilled ? '4px' : '2px',
  border: $unfilled ? '1px solid' : '',
  borderColor: theme.palette.divider,
  padding: $unfilled
    ? theme.spacing(0.25, 0.5, 0.25, 1)
    : theme.spacing(0, 0.25),
}));
