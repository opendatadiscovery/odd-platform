import type { CSSObject } from 'styled-components';
import styled from 'styled-components';
import type { InputSize, InputType } from './interfaces';

export const Container = styled('div')<{ $maxWidth?: number }>(
  ({ $maxWidth }) =>
    ({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: `${$maxWidth}px` ?? 'auto',
    } as CSSObject)
);

export const Input = styled('input')<{
  $type: InputType;
  $size: InputSize;
  $isError: boolean;
}>(({ theme, $type, $size, $isError }) => {
  type Condition = 'normal' | 'error' | 'hover' | 'active';
  const isErrorOr = (val: Condition): Condition => ($isError ? 'error' : val);

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

  if ($type === 'search' && $size === 'lg') {
    styles = {};
  }

  if ($size === 'm') {
    styles = { height: '32px', padding: theme.spacing(0.75, 3.5, 0.75, 1) };
  }

  if ($size === 'sm') {
    styles = { height: '24px', padding: theme.spacing(0.25, 3.5, 0.25, 1) };
  }

  return { ...common, ...styles } as CSSObject;
});

export const EndAdornment = styled('div')(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  right: theme.spacing(1),
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

export const Hint = styled('p')(({ theme }) => ({
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '16px',
  color: theme.palette.input.hint.color,
  margin: 0,
  marginTop: theme.spacing(0.125),
}));

export const Error = styled('p')(({ theme }) => ({
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '16px',
  color: theme.palette.input.error?.color,
  margin: 0,
  marginTop: theme.spacing(0.125),
}));
