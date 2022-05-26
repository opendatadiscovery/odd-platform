import styled from 'styled-components';
import { Button, buttonClasses } from '@mui/material';
import { breakpointDownLgBody2 } from 'theme/typography';

export type ButtonColors =
  | 'primary'
  | 'primaryLight'
  | 'secondary'
  | 'tertiary'
  | 'dropdown'
  | 'expandText'
  | 'valueCount';

interface AppButtonStyleProps {
  $color: ButtonColors;
}

const isTertiary = (color: string) => color === 'tertiary';

export const StyledAppButton = styled(Button)<AppButtonStyleProps>(
  ({ theme, $color }) => ({
    // overrides of MUI Button styles
    [`&.${buttonClasses.root}`]: {
      minWidth: 0,
      borderRadius: isTertiary($color) ? '4px' : '16px',
      letterSpacing: '0em',
      textAlign: 'center',
      textTransform: 'none',
      fontWeight: theme.typography.body1.fontWeight,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      whiteSpace: 'nowrap',
      ...breakpointDownLgBody2,
    },
    [`&.${buttonClasses.text}`]: {
      padding: isTertiary($color)
        ? theme.spacing(0, 0.5)
        : theme.spacing(0.25, 1.5),
    },
    [`& .${buttonClasses.startIcon}`]: {
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0),
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
      height: '20px',
      minWidth: 'auto',
      borderRadius: '4px',
      padding: theme.spacing(0.5, 0.5),
      fontWeight: theme.typography.body2.fontWeight,
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
      ...breakpointDownLgBody2,
    },
    // custom styles
    color: theme.palette.button[$color].normal.color,
    backgroundColor: theme.palette.button[$color].normal.background,
    '&:hover': {
      color: theme.palette.button[$color].hover?.color,
      backgroundColor: theme.palette.button[$color].hover?.background,
    },
    '&:active': {
      color: theme.palette.button[$color].active?.color,
      backgroundColor: theme.palette.button[$color].active?.background,
    },
    '&:disabled': {
      color: theme.palette.button[$color].disabled?.color,
      backgroundColor: theme.palette.button[$color].disabled?.background,
    },
  })
);
