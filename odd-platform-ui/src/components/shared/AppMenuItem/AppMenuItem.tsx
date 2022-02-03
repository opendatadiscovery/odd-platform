import React from 'react';
import { MenuItemProps } from '@mui/material';
import { StyledAppMenuItem } from './AppMenuItemStyles';

interface AppMenuItemProps
  extends Pick<MenuItemProps, 'children' | 'onClick' | 'divider'> {
  value?: string | number;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  children,
  onClick,
  value,
  divider,
}) => (
  <StyledAppMenuItem value={value} onClick={onClick} divider={divider}>
    {children}
  </StyledAppMenuItem>
);

export default AppMenuItem;
