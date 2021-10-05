import React from 'react';
import { IconButtonProps } from '@mui/material';
import { IconButtonColors, StyledIconButton } from './AppIconButtonStyles';

interface AppIconButtonProps
  extends Omit<IconButtonProps, 'color' | 'size'> {
  disabled?: boolean;
  size?: 'medium' | 'small';
  color: IconButtonColors;
  icon: React.ReactNode;
  open?: boolean;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  onClick,
  disabled,
  size = 'small',
  color,
  icon,
  open,
  sx,
}) => (
  <StyledIconButton
    $color={color}
    $open={open}
    sx={sx}
    onClick={onClick}
    disableRipple
    disabled={disabled}
    size={size}
  >
    {icon}
  </StyledIconButton>
);

export default AppIconButton;
