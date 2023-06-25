import type { CSSObject } from 'styled-components';
import styled from 'styled-components';
import { Box } from '@mui/material';
import type { InputSize, InputType } from './interfaces';

export const Container = styled(Box)<{ $maxWidth?: number }>(({ $maxWidth }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: $maxWidth !== undefined ? `${$maxWidth}px` : 'auto',
}));

export const Input = styled('input')<{
  $type: InputType;
  $size: InputSize;
  $isError: boolean;
}>(({ theme, $type, $size, $isError }) => {
  type Condition = 'normal' | 'error' | 'hover' | 'active';
  const isErrorOr = (val: Condition) => ($isError ? 'error' : val);

  const common = {
    fontFamily: 'inherit',
    width: '100%',
    borderRadius: '4px',
    border: '1px solid',
    outline: 0,
    borderColor: theme.palette.input[isErrorOr('normal')]?.border,

    '&:hover': { borderColor: theme.palette.input[isErrorOr('hover')]?.border },
    '&:focus': { borderColor: theme.palette.input[isErrorOr('active')]?.border },
    '&:disabled': {
      borderColor: theme.palette.input.disabled?.border,
      color: theme.palette.input.disabled?.color,
      backgroundColor: theme.palette.input.disabled?.background,
    },

    '&::placeholder': {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      color: theme.palette.input.normal.color,
    },
  };

  let styles = {};

  if ($size === 'm') {
    styles = { padding: theme.spacing(0.875, 4.25, 0.875, 1) };
  }

  if ($size === 'sm') {
    styles = { padding: theme.spacing(0.375, 4.25, 0.375, 1) };
  }

  if ($type === 'search' && $size === 'lg') {
    styles = {
      padding: theme.spacing(1.375, 4.25),
      borderColor: theme.palette.input.searchLg.normal.border,

      '&:hover': { borderColor: theme.palette.input.searchLg.hover.border },
      '&:focus': {
        borderColor: 'transparent',
        outline: '2px solid',
        outlineColor: theme.palette.input.searchLg.active.border,
      },
    };
  }

  if ($type === 'search' && $size === 'm') {
    styles = { padding: theme.spacing(0.875, 4.25) };
  }

  return { ...common, ...styles } as CSSObject;
});

export const Adornment = styled('div')<{ $isStart?: boolean }>(({ theme, $isStart }) => ({
  position: 'absolute',
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  [$isStart ? 'left' : 'right']: theme.spacing(1),
  top: 0,
}));

export const Label = styled('p')(({ theme }) => ({
  fontSize: '12px',
  fontWeight: 500,
  lineHeight: '16px',
  color: theme.palette.input.label.color,
  margin: 0,
  marginBottom: theme.spacing(0.125),
}));

export const Hint = styled('p')<{ $isError?: boolean }>(({ theme, $isError }) => ({
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '16px',
  color: theme.palette.input[$isError ? 'error' : 'hint']?.color,
  margin: 0,
  marginTop: theme.spacing(0.125),
}));
