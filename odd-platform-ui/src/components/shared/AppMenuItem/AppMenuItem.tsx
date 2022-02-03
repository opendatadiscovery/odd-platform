import React from 'react';
import { MenuItemProps } from '@mui/material';
import { StyledAppMenuItem } from './AppMenuItemStyles';

interface AppMenuItemProps
  extends Pick<MenuItemProps, 'children' | 'onClick'> {
  value?: string | number;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  children,
  onClick,
  value,
}) => (
  <StyledAppMenuItem value={value} onClick={onClick}>
    {children}
  </StyledAppMenuItem>
);

export default AppMenuItem;
