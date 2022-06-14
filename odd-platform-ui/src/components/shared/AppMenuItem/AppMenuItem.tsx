import React from 'react';
import { MenuItemProps } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import {
  StyledAppListItemText,
  StyledAppMenuItem,
} from './AppMenuItemStyles';

export interface AppMenuItemProps
  extends Pick<
    MenuItemProps,
    'children' | 'onClick' | 'divider' | 'value' | 'defaultValue'
  > {
  minWidth?: number;
  maxWidth?: number;
  removeTextStyles?: boolean;
  fontVariant?: Variant;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  children,
  onClick,
  value,
  divider,
  maxWidth,
  minWidth,
  removeTextStyles = false,
  fontVariant = 'body1',
  defaultValue,
}) => (
  <StyledAppMenuItem
    aria-label="AppMenuItem"
    disableRipple
    value={value}
    onClick={onClick}
    divider={divider}
    $maxWidth={maxWidth}
    $minWidth={minWidth}
    defaultValue={defaultValue}
  >
    <StyledAppListItemText
      aria-label="AppMenuItemText"
      $removeTextStyles={removeTextStyles}
      $fontVariant={fontVariant}
    >
      {children}
    </StyledAppListItemText>
  </StyledAppMenuItem>
);

export default AppMenuItem;
