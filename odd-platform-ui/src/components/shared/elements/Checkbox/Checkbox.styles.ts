import { Checkbox as MuiCheckbox, checkboxClasses, svgIconClasses } from '@mui/material';
import styled from 'styled-components';

export const StyledCheckbox = styled(MuiCheckbox)(({ theme }) => ({
  [`&.${checkboxClasses.root}`]: {
    padding: 0,
    color: theme.palette.textField.normal.border,
    [`& .${svgIconClasses.root}`]: {
      width: '20px',
      height: '20px',
    },
  },
  [`&.${checkboxClasses.checked}`]: {
    color: theme.palette.backgrounds.element,
  },
}));
