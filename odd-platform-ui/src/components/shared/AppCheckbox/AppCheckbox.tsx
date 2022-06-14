import React from 'react';
import { CheckboxProps } from '@mui/material';
import { StyledAppCheckbox } from './AppCheckboxStyles';

export type AppCheckboxProps = Pick<
  CheckboxProps,
  'sx' | 'onChange' | 'value' | 'checked'
>;

const AppCheckbox: React.FC<AppCheckboxProps> = props => (
  <StyledAppCheckbox disableRipple aria-label="AppCheckbox" {...props} />
);

export default AppCheckbox;
