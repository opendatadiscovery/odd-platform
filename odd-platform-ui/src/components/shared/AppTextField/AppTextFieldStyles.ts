import { styled } from '@mui/material/styles';
import {
  buttonBaseClasses,
  formHelperTextClasses,
  inputAdornmentClasses,
  inputBaseClasses,
  inputLabelClasses,
  nativeSelectClasses,
  outlinedInputClasses,
  selectClasses,
  TextField,
  textFieldClasses,
} from '@mui/material';
import { breakpointDownLgBody2, pxToRem } from 'theme/typography';
import { shouldForwardProp } from 'lib/helpers';

export type TextFieldSizes = 'large' | 'medium' | 'small';

interface AppTextFieldStyleProps {
  $size: TextFieldSizes;
  $isLabeled?: boolean;
}

const isLarge = (size: string) => size === 'large';
const inputYPaddingsBySize = (size: TextFieldSizes) => {
  if (size === 'large') return 1.25;
  if (size === 'small') return 0.25;
  return 0.75;
};

export const StyledAppTextField = styled(
  TextField,
  shouldForwardProp(['$size', '$isLabeled'])
)<AppTextFieldStyleProps>(({ theme, $size, $isLabeled }) => ({
  [`&.${textFieldClasses.root}`]: {
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: 'none',
      top: 0,
    },
    [`& .${outlinedInputClasses.root}`]: {
      border: '1px solid',
      borderColor:
        theme.palette.textField[isLarge($size) ? 'active' : 'normal']
          .border,
      borderRadius: '4px',
      backgroundColor: theme.palette.textField.normal.background,
      padding: 0,
      marginTop: $isLabeled ? theme.spacing(2) : 0,
      '&:hover': {
        borderColor:
          theme.palette.textField.hover[
            isLarge($size) ? 'color' : 'border'
          ],
      },
    },
    [`& .${outlinedInputClasses.focused}.${inputBaseClasses.focused}`]: {
      borderColor: isLarge($size)
        ? 'transparent'
        : theme.palette.textField.active.border,
      outline: isLarge($size) && '2px solid',
      outlineColor: theme.palette.textField.active.border,
    },
    [`& .${outlinedInputClasses.error}`]: {
      borderColor: theme.palette.textField.error?.border,
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
      padding: theme.spacing(inputYPaddingsBySize($size), 1),
      fontWeight: 400,
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),
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
      top: theme.spacing(-0.5),
    },
    [`& .${inputLabelClasses.asterisk}`]: {
      color: theme.palette.warning.main,
    },
  },
  // overriding MUI select and native select icon position
  [`& .${selectClasses.icon}, .${nativeSelectClasses.icon}`]: {
    top: 'calc(50% - 8px)',
    right: '8px',
  },
  // overriding DatePicker input's endAdornment button
  [`& .${outlinedInputClasses.root}`]: {
    [`& .${inputAdornmentClasses.root}`]: {
      [`& .${buttonBaseClasses.root}`]: {
        marginRight: 0,
        '&:hover': {
          backgroundColor: 'unset',
          color: theme.palette.button.unfilled.hover.color,
        },
      },
    },
  },
}));
