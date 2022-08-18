import React from 'react';
import { MenuItemProps } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import * as S from './AppMenuItemStyles';

interface AppMenuItemProps
  extends Pick<
    MenuItemProps,
    'children' | 'onClick' | 'divider' | 'value' | 'defaultValue' | 'ref'
  > {
  minWidth?: number;
  maxWidth?: number;
  removeTextStyles?: boolean;
  fontVariant?: Variant;
}

const AppMenuItem: React.FC<AppMenuItemProps> = React.forwardRef(
  (
    {
      children,
      onClick,
      value,
      divider,
      maxWidth = 400,
      minWidth,
      removeTextStyles = false,
      fontVariant = 'body1',
      defaultValue,
    },
    ref
  ) => (
    <S.StyledAppMenuItem
      disableRipple
      value={value}
      onClick={onClick}
      divider={divider}
      $maxWidth={maxWidth}
      $minWidth={minWidth}
      defaultValue={defaultValue}
      ref={ref}
    >
      <S.StyledAppListItemText
        $removeTextStyles={removeTextStyles}
        $fontVariant={fontVariant}
      >
        {children}
      </S.StyledAppListItemText>
    </S.StyledAppMenuItem>
  )
);

export default AppMenuItem;
