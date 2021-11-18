import React from 'react';
import { IconButtonProps } from '@mui/material';
import { IconButtonColors, StyledIconButton } from './AppIconButtonStyles';

interface AppIconButtonProps
  extends Pick<
    IconButtonProps,
    'onClick' | 'sx' | 'ref' | 'edge' | 'disabled' | 'id'
  > {
  size?: 'medium' | 'small';
  color: IconButtonColors;
  icon: React.ReactNode;
  open?: boolean;
  ariaDescribedBy?: IconButtonProps['aria-describedby'];
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  size = 'small',
  color,
  icon,
  open,
  onClick,
  sx,
  disabled,
  ariaDescribedBy,
  id,
}) => (
  <StyledIconButton
    aria-describedby={ariaDescribedBy}
    $color={color}
    $open={open}
    id={id}
    disableRipple
    size={size}
    onClick={onClick}
    sx={sx}
    disabled={disabled}
  >
    {icon}
  </StyledIconButton>
);

export default AppIconButton;
