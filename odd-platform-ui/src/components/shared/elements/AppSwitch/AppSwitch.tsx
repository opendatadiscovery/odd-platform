import React from 'react';
import { Grid, type SwitchProps, Typography } from '@mui/material';
import { StyledSwitch } from 'components/shared/elements/AppSwitch/AppSwitchStyles';

type AppSwitchProps = Pick<
  SwitchProps,
  | 'checked'
  | 'onChange'
  | 'defaultChecked'
  | 'disabled'
  | 'value'
  | 'onBlur'
  | 'name'
  | 'ref'
> & { label?: string };

const AppSwitch: React.FC<AppSwitchProps> = ({ label, ...props }) => (
  <Grid display='flex' flexWrap='nowrap' alignItems='center'>
    <StyledSwitch {...props} disableTouchRipple disableRipple />
    {label && <Typography variant='body1'>{label}</Typography>}
  </Grid>
);

export default AppSwitch;
