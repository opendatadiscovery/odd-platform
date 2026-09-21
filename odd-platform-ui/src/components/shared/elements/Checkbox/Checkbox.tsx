import React, { forwardRef } from 'react';
import { type CheckboxProps as MUICheckboxProps } from '@mui/material';
import { StyledCheckbox } from 'components/shared/elements/Checkbox/Checkbox.styles';

// `indeterminate` joins the allow-list for ST-7 (#1841): a two-state toggle standing in for a three-state
// URL scope needs a way to say "a value is active that I cannot represent" — rendering it as merely unchecked
// would misreport a filtered list as unfiltered. It is a pass-through to MUI, additive, and default-off.
// `disabled` joins it for ST-13a (#1847): the column picker shows the two fixed columns as locked rows — a
// checked box the user cannot untick — which a control that cannot be disabled could only fake. Additive too.
type CheckboxProps = Pick<
  MUICheckboxProps,
  'sx' | 'onChange' | 'value' | 'checked' | 'indeterminate' | 'disabled'
>;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => (
  <StyledCheckbox disableRipple {...props} inputRef={ref} />
));

export default Checkbox;
