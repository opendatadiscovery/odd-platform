import { styled } from '@mui/material/styles';
import { Menu, menuClasses } from '@mui/material';
import theme from 'theme/mui.theme';

export const StyledAppMenu = styled(Menu)(() => ({
  [`&.${menuClasses.root}`]: {
    minWidth: '160px',
    maxWidth: '240px',
    height: '300px',
    padding: theme.spacing(1, 0),
  },
}));
