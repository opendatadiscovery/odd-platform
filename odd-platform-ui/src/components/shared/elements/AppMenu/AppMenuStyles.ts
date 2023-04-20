import { Menu, menuClasses, type MenuProps } from '@mui/material';
import styled from 'styled-components';

interface AppMenuStyleProps extends MenuProps {
  $minWidth?: number;
  $maxWidth?: number;
  $maxHeight?: number;
}

export const StyledAppMenu = styled(Menu)<AppMenuStyleProps>(
  ({ theme, $maxHeight, $minWidth, $maxWidth }) => ({
    maxHeight: $maxHeight ? `${$maxHeight}px !important` : 'none',
    maxWidth: $maxWidth ? `${$maxWidth}px !important` : 'none',
    minWidth: $minWidth ? `${$minWidth}px !important` : 0,

    [`&.${menuClasses.paper}`]: {
      padding: theme.spacing(1, 0),
      border: ' 1px solid',
      borderColor: theme.palette.backgrounds.secondary,
      borderRadius: '4px',
    },
  })
);
