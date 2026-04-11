import React from 'react';
import { type MenuProps } from '@mui/material';
import { StyledAppMenu } from 'components/shared/elements/AppMenu/AppMenuStyles';

interface AppMenuProps extends MenuProps {
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const AppMenu: React.FC<AppMenuProps> = ({
  children,
  minWidth,
  maxWidth,
  maxHeight,
  ...props
}) => (
  <StyledAppMenu
    {...props}
    $maxHeight={maxHeight}
    $maxWidth={maxWidth}
    $minWidth={minWidth}
  >
    {children}
  </StyledAppMenu>
);

export default AppMenu;
