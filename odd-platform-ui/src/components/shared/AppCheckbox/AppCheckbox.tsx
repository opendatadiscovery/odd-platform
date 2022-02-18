import React from 'react';
import { CheckboxProps } from '@mui/material';
import { StyledAppCheckbox } from './AppCheckboxStyles';

type AppCheckboxProps = Pick<CheckboxProps, 'sx'>;

const AppCheckbox: React.FC<AppCheckboxProps> = ({ sx }) => (
  <StyledAppCheckbox sx={sx} />
);

export default AppCheckbox;
