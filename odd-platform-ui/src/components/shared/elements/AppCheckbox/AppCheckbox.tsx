import React from 'react';
import { type CheckboxProps } from '@mui/material';
import { StyledAppCheckbox } from 'components/shared/elements/AppCheckbox/AppCheckboxStyles';

type AppCheckboxProps = Pick<CheckboxProps, 'sx' | 'onChange' | 'value' | 'checked'>;

const AppCheckbox: React.FC<AppCheckboxProps> = props => (
  <StyledAppCheckbox disableRipple {...props} />
);

export default AppCheckbox;