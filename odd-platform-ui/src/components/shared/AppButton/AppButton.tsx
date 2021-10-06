import React from 'react';
import { ButtonProps } from '@mui/material';
import {
  ButtonColors,
  StyledAppButton,
} from 'components/shared/AppButton/AppButtonStyles';

interface AppButtonProps extends Omit<ButtonProps, 'color'> {
  color: ButtonColors;
}

const AppButton: React.FC<AppButtonProps> = ({
  children,
  color,
  ...props
}) => (
  <StyledAppButton
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
    $color={color}
  >
    {children}
  </StyledAppButton>
);

export default AppButton;
