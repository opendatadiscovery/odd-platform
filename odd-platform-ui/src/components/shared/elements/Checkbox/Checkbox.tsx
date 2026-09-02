import React, { forwardRef } from 'react';
import { type CheckboxProps as MUICheckboxProps } from '@mui/material';
import { StyledCheckbox } from 'components/shared/elements/Checkbox/Checkbox.styles';

// `indeterminate` joins the allow-list for ST-7 (#1841): a two-state toggle standing in for a three-state
// URL scope needs a way to say "a value is active that I cannot represent" — rendering it as merely unchecked
// would misreport a filtered list as unfiltered. It is a pass-through to MUI, additive, and default-off.
type CheckboxProps = Pick<
  MUICheckboxProps,
  'sx' | 'onChange' | 'value' | 'checked' | 'indeterminate'
>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => (
  <StyledCheckbox disableRipple {...props} inputRef={ref} />
));

export default Checkbox;
