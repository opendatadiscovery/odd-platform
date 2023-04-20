import React from 'react';
import { type IconButtonProps } from '@mui/material';
import {
  type IconButtonColors,
  StyledIconButton,
} from 'components/shared/elements/AppIconButton/AppIconButtonStyles';

interface AppIconButtonProps extends Omit<IconButtonProps, 'color'> {
  size?: 'medium' | 'small';
  color: IconButtonColors;
  icon: React.ReactNode;
  ariaDescribedBy?: IconButtonProps['aria-describedby'];
  ariaControls?: IconButtonProps['aria-controls'];
  ariaHaspopup?: IconButtonProps['aria-haspopup'];
  ariaExpanded?: IconButtonProps['aria-expanded'];
  height?: number;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  size = 'small',
  color,
  icon,
  ariaDescribedBy,
  ariaControls,
  ariaExpanded,
  ariaHaspopup,
  height,
  ...props
}) => (
  <StyledIconButton
    {...props}
    aria-describedby={ariaDescribedBy}
    aria-haspopup={ariaHaspopup}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    $color={color}
    $height={height}
    disableRipple
    size={size}
  >
    {icon}
  </StyledIconButton>
);

export default AppIconButton;
