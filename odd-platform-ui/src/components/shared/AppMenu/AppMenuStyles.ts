import { styled } from '@mui/material/styles';
import { Menu, menuClasses } from '@mui/material';
import { propsChecker } from 'lib/helpers';

export const StyledAppMenu = styled(Menu, {
  shouldForwardProp: propsChecker,
})(({ theme }) => ({
  [`&.${menuClasses.paper}`]: {
    padding: theme.spacing(1, 0),
  },
}));
