import { styled } from '@mui/material/styles';
import { buttonClasses } from '@mui/material';
import Button from '@mui/material/Button';
import { breakpointDownLgBody2 } from 'theme/typography';
import { shouldForwardProp } from 'lib/helpers';

export type ButtonColors =
  | 'primary'
  | 'primaryLight'
  | 'secondary'
  | 'tertiary'
  | 'dropdown'
  | 'expandText';

interface AppButtonStyleProps {
  $color: ButtonColors;
}

export const StyledAppButton = styled(
  Button,
  shouldForwardProp(['$color'])
)<AppButtonStyleProps>(({ theme, $color }) => ({
  // overrides of MUI Button styles
  [`&.${buttonClasses.root}`]: {
    borderRadius: '16px',
    letterSpacing: '0em',
    textAlign: 'center',
    textTransform: 'none',
    fontWeight: theme.typography.body1.fontWeight,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    ...breakpointDownLgBody2,
  },
  [`&.${buttonClasses.text}`]: { padding: theme.spacing(0.5, 1.5) },
  [`& .${buttonClasses.startIcon}`]: {
    marginRight: theme.spacing(0.5),
  },
  [`& .${buttonClasses.endIcon}`]: { marginLeft: theme.spacing(0.5) },
  [`&.${buttonClasses.sizeLarge}`]: {
    height: '32px',
    padding: theme.spacing(0.75, 1),
    borderRadius: '4px',
    fontWeight: theme.typography.h1.fontWeight,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    ...breakpointDownLgBody2,
  },
  [`&.${buttonClasses.sizeSmall}`]: {
    minWidth: 'auto',
    height: '20px',
    borderRadius: '4px',
    padding: '0 2px',
    fontWeight: theme.typography.body2.fontWeight,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    ...breakpointDownLgBody2,
  },
  // custom styles
  color: theme.palette.button[$color].normal.color,
  backgroundColor: theme.palette.button[$color].normal.background,
  '&:hover': {
    color: theme.palette.button[$color].hover.color,
    backgroundColor: theme.palette.button[$color].hover.background,
  },
  '&:active': {
    color: theme.palette.button[$color].active.color,
    backgroundColor: theme.palette.button[$color].active.background,
  },
  '&:disabled': {
    color: theme.palette.button[$color].disabled?.color,
    backgroundColor: theme.palette.button[$color].disabled?.background,
  },
}));
