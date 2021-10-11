import { styled } from '@mui/material/styles';
import {
  formHelperTextClasses,
  inputBaseClasses,
  inputLabelClasses,
  outlinedInputClasses,
  TextField,
  textFieldClasses,
} from '@mui/material';
import { breakpointDownLgBody2, pxToRem } from 'theme/typography';
import { shouldForwardProp } from 'lib/helpers';

export type TextFieldSizes = 'large' | 'medium' | 'small';

interface AppTextFieldStyleProps {
  $size: TextFieldSizes;
}

const isLarge = (size: string) => size === 'large';
const inputYPaddingsBySize = (size: TextFieldSizes) => {
  if (size === 'large') return 1.25;
  if (size === 'small') return 0.25;
  return 0.75;
};

export const StyledAppTextField = styled(
  TextField,
  shouldForwardProp(['$size'])
)<AppTextFieldStyleProps>(({ theme, $size }) => ({
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
      marginTop: theme.spacing(2),
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
    },
  },
}));
