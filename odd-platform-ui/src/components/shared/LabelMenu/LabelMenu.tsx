import React from 'react';
import { MenuProps } from '@mui/material';
import { StyledLabelMenu } from './LabelMenuStyles';

interface LabelMenuProps
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

const LabelMenu: React.FC<LabelMenuProps> = ({
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
  <StyledLabelMenu
    anchorEl={anchorEl}
    anchorOrigin={anchorOrigin}
    id={id}
    keepMounted={keepMounted}
    transformOrigin={transformOrigin}
    open={open}
    onClose={onClose}
    MenuListProps={MenuListProps}
    $maxHeight={maxHeight}
    $maxWidth={maxWidth}
    $minWidth={minWidth}
  >
    {children}
  </StyledLabelMenu>
);

export default LabelMenu;
