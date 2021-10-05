import React from 'react';
import { ButtonProps } from '@mui/material';
import {
  ButtonColors,
  StyledAppButton,
} from 'components/shared/AppButton2/AppButtonStyles2';

interface AppButtonProps extends Omit<ButtonProps, 'color'> {
  color: ButtonColors;
}

const AppButton2: React.FC<AppButtonProps> = ({
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

export default AppButton2;
