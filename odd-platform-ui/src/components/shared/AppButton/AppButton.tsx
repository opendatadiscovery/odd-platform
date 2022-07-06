import React from 'react';
import { ButtonProps } from '@mui/material';
import { ButtonColors, StyledAppButton } from './AppButtonStyles';

interface AppButtonProps
  extends Pick<
    ButtonProps,
    | 'size'
    | 'onClick'
    | 'sx'
    | 'startIcon'
    | 'endIcon'
    | 'fullWidth'
    | 'disabled'
    | 'type'
    | 'form'
    | 'autoFocus'
    | 'id'
    | 'ref'
    | 'children'
    | 'itemRef'
  > {
  color: ButtonColors;
}

const AppButton: React.FC<AppButtonProps> = React.forwardRef(
  ({ color, children, ...props }, ref) => (
    <StyledAppButton
      {...props}
      focusRipple
      $color={color}
      ref={ref}
      disableRipple
    >
      {children}
    </StyledAppButton>
  )
);

export default AppButton;
