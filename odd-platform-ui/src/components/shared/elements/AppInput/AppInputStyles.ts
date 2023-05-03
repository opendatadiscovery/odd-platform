import styled from 'styled-components';
import {
  autocompleteClasses,
  buttonBaseClasses,
  formHelperTextClasses,
  inputAdornmentClasses,
  inputBaseClasses,
  inputLabelClasses,
  outlinedInputClasses,
  TextField,
  textFieldClasses,
} from '@mui/material';
import { breakpointDownLgBody2, pxToRem } from 'theme/typography';

export type AppInputSizes = 'large' | 'medium' | 'small';

interface AppInputStyleProps {
  $size: AppInputSizes;
  $isLabeled?: boolean;
}

const isLarge = (size: string) => size === 'large';
const inputYPaddingsBySize = (size: AppInputSizes) => {
  if (size === 'large') return 1.25;
  if (size === 'small') return 0.25;
  return 0.625;
};

export const StyledAppInput = styled(TextField)<AppInputStyleProps>(
  ({ theme, $size, $isLabeled }) => ({
    [`&.${textFieldClasses.root}`]: {
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: 'none',
        top: 0,
      },
      [`& .${outlinedInputClasses.root}`]: {
        [`& .${autocompleteClasses.input}`]: {
          padding: theme.spacing(inputYPaddingsBySize($size), 1),
        },
        border: '1px solid',
        borderColor: theme.palette.textField[isLarge($size) ? 'active' : 'normal'].border,
        borderRadius: '4px',
        backgroundColor: theme.palette.textField.normal.background,
        padding: 0,
        marginTop: $isLabeled ? theme.spacing(2) : 0,
        '&:hover': {
          borderColor: theme.palette.textField.hover[isLarge($size) ? 'color' : 'border'],
        },
      },
      [`& .${outlinedInputClasses.focused}.${inputBaseClasses.focused}`]: {
        borderColor: isLarge($size)
          ? 'transparent'
          : theme.palette.textField.active.border,
        outline: isLarge($size) ? '2px solid' : 'none',
        outlineColor: theme.palette.textField.active.border,
      },
      [`& .${outlinedInputClasses.error}`]: {
        borderColor: `${theme.palette.textField.error?.border} !important`,
      },
      [`& .${outlinedInputClasses.disabled}`]: {
        borderColor: theme.palette.textField.disabled?.border,
      },
      [`& .${formHelperTextClasses.root}`]: {
        color: theme.palette.textField.error?.border,
        margin: 0,
        lineHeight: '16px',
      },
      [`& .${inputBaseClasses.input}`]: {
        height: 'auto',
        padding: theme.spacing(inputYPaddingsBySize($size), 1),
        color: theme.palette.texts.primary,
        fontWeight: 400,
        fontSize: pxToRem(14),
        lineHeight: pxToRem(20),
        '&::-webkit-scrollbar': { display: 'none' },
        ...breakpointDownLgBody2,
      },
      [`& .${inputLabelClasses.root}`]: {
        color: theme.palette.texts.secondary,
        fontWeight: theme.typography.h5.fontWeight,
        fontSize: theme.typography.h5.fontSize,
        lineHeight: theme.typography.h5.lineHeight,
        transform: 'none',
        border: 'none',
        outline: 'none !important',
        top: theme.spacing(-0.25),
      },
      [`& .${inputLabelClasses.asterisk}`]: { color: theme.palette.texts.secondary },
    },
    // overriding DatePicker input's endAdornment button
    [`& .${outlinedInputClasses.root}`]: {
      [`& .${inputAdornmentClasses.root}`]: {
        [`& .${buttonBaseClasses.root}`]: {
          marginRight: 0,
          '&:hover': {
            backgroundColor: 'unset',
            color: theme.palette.backgrounds.secondary,
          },
        },
      },
    },
  })
);
