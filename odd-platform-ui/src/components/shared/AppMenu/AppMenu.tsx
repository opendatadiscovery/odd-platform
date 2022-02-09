import React from 'react';
import { MenuProps } from '@mui/material';
import { StyledAppMenu } from './AppMenuStyles';

interface AppMenuProps
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
  children,
  anchorEl,
  anchorOrigin,
  id,
  keepMounted,
  transformOrigin,
  open,
  onClose,
  MenuListProps,
  minWidth,
  maxWidth,
  maxHeight,
}) => (
  <StyledAppMenu
    anchorEl={anchorEl}
    anchorOrigin={anchorOrigin}
    id={id}
    keepMounted={keepMounted}
    transformOrigin={transformOrigin}
    open={open}
    onClose={onClose}
    MenuListProps={MenuListProps}
    PaperProps={{
      style: {
        minWidth: minWidth ? `${minWidth}px` : 0,
        maxWidth: maxWidth ? `${maxWidth}px` : 'none',
        maxHeight: maxHeight ? `${maxHeight}px` : 'none',
      },
    }}
  >
    {children}
  </StyledAppMenu>
);

export default AppMenu;
