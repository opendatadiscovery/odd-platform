import { Checkbox, checkboxClasses, svgIconClasses } from '@mui/material';
import styled from 'styled-components';

export const StyledAppCheckbox = styled(Checkbox)(({ theme }) => ({
  [`&.${checkboxClasses.root}`]: {
    padding: 0,
    color: theme.palette.textField.normal.border,
    [`& .${svgIconClasses.root}`]: {
      fontSize: '1.1667rem',
    },
  },
  [`&.${checkboxClasses.checked}`]: {
    color: theme.palette.backgrounds.element,
  },
}));
