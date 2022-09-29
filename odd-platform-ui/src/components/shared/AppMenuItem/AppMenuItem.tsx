import React from 'react';
import { MenuItemProps } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import * as S from './AppMenuItemStyles';

interface AppMenuItemProps
  extends Pick<
    MenuItemProps,
    'children' | 'onClick' | 'divider' | 'value' | 'defaultValue' | 'ref' | 'disabled'
  > {
  minWidth?: number;
  maxWidth?: number;
  removeTextStyles?: boolean;
  fontVariant?: Variant;
}

const AppMenuItem: React.FC<AppMenuItemProps> = React.forwardRef(
  (
    {
      maxWidth = 400,
      minWidth,
      removeTextStyles = false,
      fontVariant = 'body1',
      ...props
    },
    ref
  ) => (
    <S.StyledAppMenuItem
      {...props}
      disableRipple
      $maxWidth={maxWidth}
      $minWidth={minWidth}
      ref={ref}
    >
      <S.StyledAppListItemText
        $removeTextStyles={removeTextStyles}
        $fontVariant={fontVariant}
      >
        {props.children}
      </S.StyledAppListItemText>
    </S.StyledAppMenuItem>
  )
);

export default AppMenuItem;
