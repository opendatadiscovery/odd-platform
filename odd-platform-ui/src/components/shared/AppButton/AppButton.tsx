import React from 'react';
import { ButtonProps } from '@mui/material';
import { ButtonColors, StyledAppButton } from './AppButtonStyles';

export interface AppButtonProps
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
  > {
  color: ButtonColors;
}

const AppButton: React.FC<AppButtonProps> = ({
  children,
  color,
  size,
  onClick,
  sx,
  startIcon,
  endIcon,
  fullWidth,
  disabled,
  type,
  form,
}) => (
  <StyledAppButton
    aria-label="AppButton"
    $color={color}
    disableRipple
    size={size}
    onClick={onClick}
    sx={sx}
    startIcon={startIcon}
    endIcon={endIcon}
    fullWidth={fullWidth}
    disabled={disabled}
    type={type}
    form={form}
  >
    {children}
  </StyledAppButton>
);

export default AppButton;
