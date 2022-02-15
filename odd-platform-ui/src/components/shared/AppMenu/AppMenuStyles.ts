import { styled } from '@mui/material/styles';
import { Menu, menuClasses } from '@mui/material';
import { propsChecker } from 'lib/helpers';

interface AppMenuStyleProps {
  $minWidth?: number;
  $maxWidth?: number;
  $maxHeight?: number;
}

export const StyledAppMenu = styled(Menu, {
  shouldForwardProp: propsChecker,
})<AppMenuStyleProps>(({ theme, $maxHeight, $minWidth, $maxWidth }) => ({
  maxHeight: $maxHeight ? `${$maxHeight}px !important` : 'none',
  maxWidth: $maxWidth ? `${$maxWidth}px !important` : 'none',
  minWidth: $minWidth ? `${$minWidth}px !important` : 0,

  [`&.${menuClasses.paper}`]: {
    padding: theme.spacing(1, 0),
  },
}));
