import React from 'react';
import { type MenuItemProps } from '@mui/material';
import { type Variant } from '@mui/material/styles/createTypography';
import * as S from 'components/shared/elements/AppMenuItem/AppMenuItemStyles';

interface AppMenuItemProps
  extends Pick<
    MenuItemProps,
    | 'children'
    | 'onClick'
    | 'divider'
    | 'value'
    | 'defaultValue'
    | 'ref'
    | 'disabled'
    | 'sx'
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
