import styled from 'styled-components';
import {
  InputLabel,
  nativeSelectClasses,
  outlinedInputClasses,
  Select,
  selectClasses,
} from '@mui/material';

export type AppSelectSizes = 'medium' | 'small';

interface AppSelectStyleProps {
  $size: AppSelectSizes;
  $isLabeled?: boolean;
}

const isMedium = (size: AppSelectSizes) => size === 'medium';

export const AppSelect = styled(Select)<AppSelectStyleProps>(
  ({ theme, $size, $isLabeled }) => ({
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      borderColor: theme.palette.textField.normal.border,
      borderWidth: '1px',
    },
    [`&.${outlinedInputClasses.root}`]: {
      height: isMedium($size) ? '32px' : '24px',
      marginTop: $isLabeled ? theme.spacing(0.5) : 0,

      '&:hover': {
        [`& .${outlinedInputClasses.notchedOutline}`]: {
          borderColor: theme.palette.textField.hover.border,
        },
      },

      [`& .${selectClasses.select}`]: {
        paddingTop: theme.spacing(isMedium($size) ? 0.75 : 0.5),
        paddingBottom: theme.spacing(isMedium($size) ? 0.75 : 0.5),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(4),
      },

      [`& .${nativeSelectClasses.select}`]: {
        padding: theme.spacing(isMedium($size) ? 0.75 : 0.5, 1),
      },
    },
    '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.textField.active.border,
      borderWidth: '1px',
    },
    '&.MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.textField.normal.border,
    },

    [`& .${selectClasses.icon}, .${nativeSelectClasses.icon}`]: {
      top: 'calc(50% - 8px)',
      right: '8px',
    },
  })
);

export const SelectLabel = styled(InputLabel)(({ theme }) => ({
  color: theme.palette.texts.secondary,
  fontWeight: theme.typography.h5.fontWeight,
  fontSize: theme.typography.h5.fontSize,
  lineHeight: theme.typography.h5.lineHeight,
}));
