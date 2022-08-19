import React from 'react';
import { ButtonProps } from '@mui/material';
import { ButtonColors, Loader, StyledAppButton } from './AppButtonStyles';

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
  isLoading?: boolean;
}

const AppButton: React.FC<AppButtonProps> = React.forwardRef(
  ({ color, isLoading, children, ...props }, ref) => (
    <StyledAppButton
      {...props}
      focusRipple
      $color={color}
      ref={ref}
      disableRipple
    >
      {isLoading ? <Loader /> : children}
    </StyledAppButton>
  )
);

export default AppButton;
