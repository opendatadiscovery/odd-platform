import { styled, type CSSObject } from '@mui/material';
import { breakpointDownLgBody2 } from 'theme/typography';
import { Link } from 'react-router-dom';

export type ButtonSize = 'sm' | 'm' | 'lg';

export type ButtonColor =
  | 'main'
  | 'secondary'
  | 'secondarySuccess'
  | 'secondaryWarning'
  | 'tertiary'
  | 'link'
  | 'expand';

interface ButtonProps {
  $color: ButtonColor;
  $size: ButtonSize;
  $fullWidth: boolean | undefined;
  $iconButton: boolean | undefined;
}

export const StyledButton = styled('button')<ButtonProps>(
  ({ theme, $color, $fullWidth, $size, $iconButton }) => {
    const isColor = (color: ButtonColor) => $color === color;

    const common = {
      width: $fullWidth ? '100%' : 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'inherit',
      border: 'none',
      minWidth: 0,

      ...breakpointDownLgBody2,

      color: theme.palette.newButton[$color].normal.color,
      backgroundColor: theme.palette.newButton[$color].normal.background,

      '&:hover': {
        cursor: 'pointer',
        color: theme.palette.newButton[$color].hover.color,
        backgroundColor: theme.palette.newButton[$color].hover.background,
      },
      '&:active': {
        color: theme.palette.newButton[$color].active.color,
        backgroundColor: theme.palette.newButton[$color].active.background,
      },
      '&:disabled': {
        cursor: 'auto',
        color: theme.palette.newButton[$color].disabled?.color,
        backgroundColor: theme.palette.newButton[$color].disabled?.background,
      },
    };

    const mainLg = {
      height: '32px',
      fontWeight: theme.typography.h4.fontWeight,
      fontSize: theme.typography.h4.fontSize,
      lineHeight: theme.typography.h4.lineHeight,
      borderRadius: '4px',
      padding: theme.spacing(0.75, 1),
    };

    const mainM = {
      height: '24px',
      fontWeight: theme.typography.h5.fontWeight,
      fontSize: theme.typography.h5.fontSize,
      lineHeight: theme.typography.h5.lineHeight,
      borderRadius: '4px',
      padding: theme.spacing(0.5, 1),
    };

    const secondaryLg = {
      height: '32px',
      fontWeight: theme.typography.h4.fontWeight,
      fontSize: theme.typography.h4.fontSize,
      lineHeight: theme.typography.h4.lineHeight,
      borderRadius: '16px',
      padding: theme.spacing(0.75, 1.5),
    };

    const secondaryM = {
      height: '24px',
      fontWeight: theme.typography.body1.fontWeight,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      borderRadius: '16px',
      padding: theme.spacing(0.25, 1.5),
    };

    const secondaryIconM = {
      height: '24px',
      borderRadius: '16px',
      padding: theme.spacing(0.5),
    };

    const tertiaryLg = {
      height: '20px',
      fontWeight: theme.typography.body1.fontWeight,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      borderRadius: '4px',
      padding: theme.spacing(0, 0.5),
    };

    const linkSm = {
      height: '20px',
      fontWeight: theme.typography.body1.fontWeight,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      padding: theme.spacing(0),
    };

    const getStyles = () => {
      if (isColor('main') && $size === 'lg') return mainLg;
      if (isColor('main') && $size === 'm') return mainM;

      if (
        $size === 'lg' &&
        (isColor('secondary') ||
          isColor('secondaryWarning') ||
          isColor('secondarySuccess'))
      ) {
        return secondaryLg;
      }

      if (
        $iconButton &&
        $size === 'm' &&
        (isColor('secondary') ||
          isColor('secondaryWarning') ||
          isColor('secondarySuccess'))
      ) {
        return secondaryIconM;
      }

      if (
        $size === 'm' &&
        (isColor('secondary') ||
          isColor('secondaryWarning') ||
          isColor('secondarySuccess'))
      ) {
        return secondaryM;
      }

      if (isColor('tertiary') && $size === 'lg') return tertiaryLg;
      if (isColor('link') && $size === 'sm') return linkSm;
    };

    return { ...getStyles(), ...common } as CSSObject;
  }
);

export const StyledLink = styled(Link)<{
  $disabled?: boolean;
}>(({ $disabled }) => ({
  display: 'flex',
  height: 'fit-content',
  minWidth: 0,
  pointerEvents: $disabled ? 'none' : undefined,
}));

export const Text = styled('div')(() => ({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}));

export const Icon = styled('span')<{
  $start?: boolean;
  $end?: boolean;
  $size: ButtonSize;
}>(({ theme, $start, $end, $size }) => {
  const spacing = $size === 'lg' ? 1 : 0.5;

  return {
    display: 'inline-flex',
    marginRight: theme.spacing($start ? spacing : 0),
    marginLeft: theme.spacing($end ? spacing : 0),
  };
});

const loaderDotSize = 4;

export const Loader = styled('div')<{ $color: ButtonColor }>(({ theme, $color }) => ({
  position: 'relative',
  width: `${loaderDotSize}px`,
  height: `${loaderDotSize}px`,
  borderRadius: '50%',
  animation: `dotFlashing 1s infinite linear alternate`,
  animationDelay: '.2s',
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
    '0%': { backgroundColor: theme.palette.newButton[$color].loaderBg?.end },
    '50%, 100%': { backgroundColor: theme.palette.newButton[$color].loaderBg?.start },
  },
}));
