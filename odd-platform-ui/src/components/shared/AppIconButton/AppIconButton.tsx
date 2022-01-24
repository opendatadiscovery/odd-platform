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
  ariaControls?: IconButtonProps['aria-controls'];
  ariaHaspopup?: IconButtonProps['aria-haspopup'];
  ariaExpanded?: IconButtonProps['aria-expanded'];
  height?: number;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  size = 'small',
  color,
  icon,
  open,
  onClick,
  sx,
  disabled,
  id,
  ariaDescribedBy,
  ariaControls,
  ariaExpanded,
  ariaHaspopup,
  edge,
  height,
}) => (
  <StyledIconButton
    aria-describedby={ariaDescribedBy}
    aria-haspopup={ariaHaspopup}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    edge={edge}
    $color={color}
    $open={open}
    $height={height}
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
