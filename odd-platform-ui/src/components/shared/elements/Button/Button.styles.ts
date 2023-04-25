import { styled } from '@mui/material';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { mapKeysToValue } from 'lib/helpers';
import {
  type ButtonColor,
  type ButtonSize,
  type Button,
  ButtonSizeEnum,
  ButtonColorEnum,
} from './interfaces';
import { getButtonFontType, getButtonType } from './helpers';

interface ButtonProps {
  $color: ButtonColor;
  $size: ButtonSize;
  $fullWidth: boolean | undefined;
  $iconButton: boolean | undefined;
}

export const StyledButton = styled('button')<ButtonProps>(
  ({ theme, $color, $size, $iconButton, $fullWidth }) => {
    const btnType = getButtonType($color, $size, $iconButton);
    const btnFontType = getButtonFontType($color, $size);

    const common = {
      width: $fullWidth ? '100%' : 'auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'inherit',
      border: 'none',
      minWidth: 0,

      color: theme.palette.newButton[$color].normal.color,
      backgroundColor: theme.palette.newButton[$color].normal.background,

      fontWeight: theme.typography[btnFontType].fontWeight,
      fontSize: theme.typography[btnFontType].fontSize,
      lineHeight: theme.typography[btnFontType].lineHeight,

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

    const stylesByButtonType: Record<Button, CSSProperties> = {
      ...mapKeysToValue(
        [
          getButtonType(ButtonColorEnum.secondary, ButtonSizeEnum.m),
          getButtonType(ButtonColorEnum.secondarySuccess, ButtonSizeEnum.m),
          getButtonType(ButtonColorEnum.secondaryWarning, ButtonSizeEnum.m),
        ],
        {
          height: '24px',
          borderRadius: '16px',
          padding: theme.spacing(0.25, 1.5),
        }
      ),
      [getButtonType(ButtonColorEnum.main, ButtonSizeEnum.lg)]: {
        height: '32px',
        borderRadius: '4px',
        padding: theme.spacing(0.75, 1),
      },
      [getButtonType(ButtonColorEnum.main, ButtonSizeEnum.m)]: {
        height: '24px',
        borderRadius: '4px',
        padding: theme.spacing(0.5, 1),
      },
      [getButtonType(ButtonColorEnum.secondary, ButtonSizeEnum.lg)]: {
        height: '32px',
        borderRadius: '16px',
        padding: theme.spacing(0.75, 1.5),
      },
      [getButtonType(ButtonColorEnum.secondary, ButtonSizeEnum.sm)]: {
        height: '16px',
        borderRadius: '2px',
        padding: theme.spacing(0, 0.25),
      },
      [getButtonType(ButtonColorEnum.secondary, ButtonSizeEnum.m, true)]: {
        height: '24px',
        borderRadius: '16px',
        padding: theme.spacing(0.5),
      },
      [getButtonType(ButtonColorEnum.secondary, ButtonSizeEnum.sm, true)]: {
        height: '16px',
        borderRadius: '8px',
      },
      [getButtonType(ButtonColorEnum.tertiary, ButtonSizeEnum.m)]: {
        height: '20px',
        borderRadius: '4px',
        padding: theme.spacing(0, 0.5),
      },
      [getButtonType(ButtonColorEnum.tertiary, ButtonSizeEnum.m, true)]: {
        height: '20px',
        borderRadius: '4px',
        padding: theme.spacing(0.25),
      },
      [getButtonType(ButtonColorEnum.link, ButtonSizeEnum.m)]: {
        height: '20px',
        padding: theme.spacing(0),
      },
    };

    return { ...common, ...stylesByButtonType[btnType] };
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
