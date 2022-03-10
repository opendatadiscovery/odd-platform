import React from 'react';
import { CheckboxProps } from '@mui/material';
import { StyledAppCheckbox } from './AppCheckboxStyles';

export type AppCheckboxProps = Pick<CheckboxProps, 'sx'>;

const AppCheckbox: React.FC<AppCheckboxProps> = ({ sx }) => (
  <StyledAppCheckbox disableRipple sx={sx} aria-label="AppCheckbox" />
);

export default AppCheckbox;
