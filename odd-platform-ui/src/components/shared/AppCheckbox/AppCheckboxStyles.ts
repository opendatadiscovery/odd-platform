import { Checkbox, checkboxClasses, svgIconClasses } from '@mui/material';
import styled from 'styled-components';

export const StyledAppCheckbox = styled(Checkbox)(({ theme }) => ({
  [`& ${svgIconClasses.root}`]: {
    width: theme.typography.body1.fontSize,
    height: theme.typography.body1.fontSize,
  },
  [`&.${checkboxClasses.root}`]: {
    color: theme.palette.textField.normal.border,
  },
  [`&.${checkboxClasses.colorSecondary}`]: {
    '&:hover': {
      backgroundColor: 'unset',
    },
  },
  [`&.${checkboxClasses.checked}`]: {
    color: theme.palette.button.primary.normal.background,
    '&:hover': {
      backgroundColor: 'unset !important',
    },
  },
  '& svg': {
    fontSize: theme.typography.h2.fontSize,
  },
}));
