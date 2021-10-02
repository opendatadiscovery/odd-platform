import React from 'react';
import { ButtonProps } from '@mui/material';
import {
  ButtonColors,
  StyledAppButton,
} from 'components/shared/AppButton2/AppButtonStyles2';

interface AppButtonProps extends Omit<ButtonProps, 'color'> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  size: 'large' | 'medium' | 'small';
  color: ButtonColors;
}

const AppButton2: React.FC<AppButtonProps> = ({
  children,
  onClick,
  startIcon,
  endIcon,
  disabled,
  size,
  color,
  sx,
}) => (
  <StyledAppButton
    $color={color}
    sx={sx}
    onClick={onClick}
    disabled={disabled}
    size={size}
    disableRipple
    startIcon={startIcon}
    endIcon={endIcon}
  >
    {children}
  </StyledAppButton>
);

export default AppButton2;
