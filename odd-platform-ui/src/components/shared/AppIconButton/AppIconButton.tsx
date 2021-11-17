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
}

const AppIconButton: React.FC<AppIconButtonProps> = React.forwardRef(
  (
    { size = 'small', color, icon, open, onClick, sx, disabled, id },
    ref
  ) => (
    <StyledIconButton
      $color={color}
      $open={open}
      disableRipple
      size={size}
      onClick={onClick}
      sx={sx}
      disabled={disabled}
      ref={ref}
      id={id}
    >
      {icon}
    </StyledIconButton>
  )
);

export default AppIconButton;
