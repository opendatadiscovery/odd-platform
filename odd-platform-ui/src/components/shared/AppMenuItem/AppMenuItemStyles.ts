import { styled } from '@mui/material/styles';
import { MenuItem, menuItemClasses } from '@mui/material';
import theme from 'theme/mui.theme';

export const StyledAppMenuItem = styled(MenuItem)(() => ({
  [`&.${menuItemClasses.root}`]: {
    fontSize: '14px',
    lineHeight: '20px',
    '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  },
}));
