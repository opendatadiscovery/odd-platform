import styled from 'styled-components';
import { nativeSelectClasses, selectClasses, Select } from '@mui/material';
import { breakpointDownLgBody2, pxToRem } from 'theme/typography';

export type AppSelectSizes = 'large' | 'medium' | 'small';

interface AppSelectStyleProps {
  $size: AppSelectSizes;
  $isLabeled?: boolean;
  $isDataEntityPage?: boolean;
}
const isLarge = (size: string) => size === 'large';
const inputYPaddingsBySize = (size: AppSelectSizes) => {
  if (size === 'large') return 1.25;
  if (size === 'small') return 0.25;
  return 0.75;
};

export const StyledAppSelect = styled(Select)<AppSelectStyleProps>(
  ({ theme, $size, $isDataEntityPage }) => ({
    '&.css-s7ktka-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        borderColor: isLarge($size)
          ? 'transparent'
          : theme.palette.textField.active.border,
        outline: isLarge($size) ? '2px solid' : 'none',
        outlineColor: theme.palette.textField.active.border,
        borderWidth: theme.spacing(0.13),
      },
    '&.css-1x93o3k-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        borderColor: isLarge($size)
          ? 'transparent'
          : theme.palette.textField.active.border,
        outline: isLarge($size) ? '2px solid' : 'none',
        outlineColor: theme.palette.textField.active.border,
        borderWidth: theme.spacing(0.13),
      },
    '&.css-s02ubf-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        borderColor: isLarge($size)
          ? 'transparent'
          : theme.palette.textField.active.border,
        outline: isLarge($size) ? '2px solid' : 'none',
        outlineColor: theme.palette.textField.active.border,
        borderWidth: theme.spacing(0.13),
      },

    '&.css-145y0p8-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        borderColor: isLarge($size)
          ? 'transparent'
          : theme.palette.textField.active.border,
        outline: isLarge($size) ? '2px solid' : 'none',
        outlineColor: theme.palette.textField.active.border,
        borderWidth: theme.spacing(0.13),
      },

    ...(!$isDataEntityPage
      ? {
          marginTop: theme.spacing(4),
          legend: {
            span: {
              color: theme.palette.texts.secondary,
              fontWeight: theme.typography.h5.fontWeight,
              fontSize: theme.typography.h5.fontSize,
              lineHeight: theme.typography.h5.lineHeight,
              transform: 'none',
              marginLeft: theme.spacing(-1.75),
              border: 'none',
              outline: 'none !important',
              top: theme.spacing(-2),
              opacity: 1,
              position: 'absolute',
            },
          },
        }
      : {}),

    select: {
      padding: theme.spacing(0.25, 1),
    },
    [`& .${selectClasses.select}`]: {
      padding: theme.spacing(inputYPaddingsBySize($size), 1),
      fontWeight: 400,
      fontSize: pxToRem(14),
      lineHeight: pxToRem(20),

      ...breakpointDownLgBody2,
    },
    [`& .${selectClasses.icon}, .${nativeSelectClasses.icon}`]: {
      top: 'calc(50% - 8px)',
      right: '8px',
    },
  })
);
