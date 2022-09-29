import styled from 'styled-components';
import { Button, buttonClasses } from '@mui/material';
import { breakpointDownLgBody2 } from 'theme/typography';

export type ButtonColors =
  | 'primary'
  | 'primaryLight'
  | 'secondary'
  | 'secondarySuccess'
  | 'secondaryWarn'
  | 'tertiary'
  | 'dropdown'
  | 'expandText'
  | 'valueCount';

interface AppButtonStyleProps {
  $color: ButtonColors;
  $isOverflowed?: boolean;
}

const isTertiary = (color: string) => color === 'tertiary';

export const StyledAppButton = styled(Button)<AppButtonStyleProps>(
  ({ theme, $color, $isOverflowed }) => ({
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
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      ...breakpointDownLgBody2,
      ...($isOverflowed && { width: 'inherit', display: 'block' }),
    },
    [`&.${buttonClasses.text}`]: {
      padding: isTertiary($color) ? theme.spacing(0, 0.5) : theme.spacing(0.25, 1.5),
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

const loaderDotSize = 4;

export const Loader = styled('div')(({ theme }) => ({
  position: 'relative',
  width: `${loaderDotSize}px`,
  height: `${loaderDotSize}px`,
  borderRadius: '50%',
  animation: `dotFlashing 1s infinite linear alternate`,
  animationDelay: '.5s',
  '&::before, &::after': {
    content: '""',
    display: 'inline-block',
    position: 'absolute',
    top: 0,
  },
  '&::before': {
    left: `-${loaderDotSize * 2}px`,
    width: `${loaderDotSize}px`,
    height: `${loaderDotSize}px`,
    borderRadius: '50%',
    animation: `dotFlashing 1s infinite linear alternate`,
    animationDelay: '0s',
  },
  '&:after': {
    left: `${loaderDotSize * 2}px`,
    width: `${loaderDotSize}px`,
    height: `${loaderDotSize}px`,
    borderRadius: '50%',
    animation: `dotFlashing 1s infinite linear alternate`,
    animationDelay: '1s',
  },
  '@keyframes dotFlashing': {
    '0%': { backgroundColor: theme.palette.button.animationParas.end },
    '50%, 100%': { backgroundColor: theme.palette.button.animationParas.start },
  },
}));
