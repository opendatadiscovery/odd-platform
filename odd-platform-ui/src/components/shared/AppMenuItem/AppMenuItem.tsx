import React from 'react';
import { MenuItemProps } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
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
  fontValue?: Variant;
}

const AppMenuItem: React.FC<AppMenuItemProps> = ({
  children,
  onClick,
  value,
  divider,
  maxWidth,
  minWidth,
  removeTextStyles = false,
  fontValue = 'body1',
}) => (
  <StyledAppMenuItem
    value={value}
    onClick={onClick}
    divider={divider}
    $maxWidth={maxWidth}
    $minWidth={minWidth}
  >
    <StyledAppListItemText
      $removeTextStyles={removeTextStyles}
      $fontValue={fontValue}
    >
      {children}
    </StyledAppListItemText>
  </StyledAppMenuItem>
);

export default AppMenuItem;
