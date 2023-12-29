import React, { forwardRef } from 'react';
import { type CheckboxProps as MUICheckboxProps } from '@mui/material';
import { StyledCheckbox } from 'components/shared/elements/Checkbox/Checkbox.styles';

type CheckboxProps = Pick<MUICheckboxProps, 'sx' | 'onChange' | 'value' | 'checked'>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => (
  <StyledCheckbox disableRipple {...props} inputRef={ref} />
));

export default Checkbox;
