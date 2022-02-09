import React from 'react';
import { MenuItemProps } from '@mui/material';
import {
  StyledAppMenuItem,
  StyledAppListItemText,
} from './AppMenuItemStyles';

interface AppMenuItemProps
  extends Pick<
    MenuItemProps,
    'children' | 'onClick' | 'divider' | 'value'
  > {
  minWidth?: number;
  maxWidth?: number;
  removeTextStyles?: boolean;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  children,
  onClick,
  value,
  divider,
  maxWidth,
  minWidth,
  removeTextStyles = false,
}) => (
  <StyledAppMenuItem
    value={value}
    onClick={onClick}
    divider={divider}
    $maxWidth={maxWidth}
    $minWidth={minWidth}
  >
    <StyledAppListItemText $removeTextStyles={removeTextStyles}>
      {children}
    </StyledAppListItemText>
  </StyledAppMenuItem>
);

export default AppMenuItem;
