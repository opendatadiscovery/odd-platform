import React from 'react';
import { type CheckboxProps as MUICheckboxProps } from '@mui/material';
import { StyledCheckbox } from 'components/shared/elements/Checkbox/Checkbox.styles';

type CheckboxProps = Pick<MUICheckboxProps, 'sx' | 'onChange' | 'value' | 'checked'>;

const Checkbox: React.FC<CheckboxProps> = props => (
  <StyledCheckbox disableRipple {...props} />
);

export default Checkbox;
