import React from 'react';
import { MenuProps } from '@mui/material';
import { StyledAppMenu } from './AppMenuStyles';

export interface AppMenuProps
  extends Pick<
    MenuProps,
    | 'children'
    | 'anchorEl'
    | 'anchorOrigin'
    | 'id'
    | 'transformOrigin'
    | 'open'
    | 'onClose'
    | 'MenuListProps'
    | 'keepMounted'
  > {
  minWidth?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const AppMenu: React.FC<AppMenuProps> = ({
  minWidth,
  maxWidth,
  maxHeight,
  ...props
}) => (
  <StyledAppMenu
    {...props}
    aria-label="AppMenu"
    $maxHeight={maxHeight}
    $maxWidth={maxWidth}
    $minWidth={minWidth}
  >
    {props.children}
  </StyledAppMenu>
);

export default AppMenu;
