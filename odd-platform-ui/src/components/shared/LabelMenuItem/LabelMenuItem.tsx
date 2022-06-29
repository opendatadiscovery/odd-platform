import React from 'react';
import { MenuItemProps } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import {
  StyledLabelMenuItem,
  StyledLabelListItemText,
} from './LabelMenuItemStyles';

interface LabelMenuItemProps extends Pick<MenuItemProps, 'children'> {
  minWidth?: number;
  maxWidth?: number;
  fontVariant?: Variant;
}

const LabelMenuItem: React.FC<LabelMenuItemProps> = ({
  children,
  maxWidth,
  minWidth,
  fontVariant = 'body1',
}) => (
  <StyledLabelMenuItem $maxWidth={maxWidth} $minWidth={minWidth}>
    <StyledLabelListItemText $fontVariant={fontVariant}>
      {children}
    </StyledLabelListItemText>
  </StyledLabelMenuItem>
);

export default LabelMenuItem;
