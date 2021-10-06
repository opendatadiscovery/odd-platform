import React from 'react';
import { IconButtonProps } from '@mui/material';
import { IconButtonColors, StyledIconButton } from './AppIconButtonStyles';

interface AppIconButtonProps
  extends Omit<IconButtonProps, 'color' | 'size'> {
  size?: 'medium' | 'small';
  color: IconButtonColors;
  icon: React.ReactNode;
  open?: boolean;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  size = 'small',
  color,
  icon,
  open,
  ...props
}) => (
  <StyledIconButton
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    $color={color}
    $open={open}
    disableRipple
    size={size}
  >
    {icon}
  </StyledIconButton>
);

export default AppIconButton;
