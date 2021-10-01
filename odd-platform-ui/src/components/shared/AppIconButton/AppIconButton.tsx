import React from 'react';
import { IconButtonProps } from '@mui/material';
import { IconButtonColors, StyledIconButton } from './AppIconButtonStyles';

interface AppIconButtonProps
  extends Omit<IconButtonProps, 'color' | 'size'> {
  disabled?: boolean;
  size?: 'medium' | 'small';
  color: IconButtonColors;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  onClick,
  children,
  disabled,
  size = 'small',
  color,
}) => (
  <StyledIconButton
    $color={color}
    onClick={onClick}
    disableRipple
    disabled={disabled}
    size={size}
  >
    {children}
  </StyledIconButton>
);

export default AppIconButton;
