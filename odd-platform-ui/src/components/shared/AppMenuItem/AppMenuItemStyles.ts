import { styled } from '@mui/material/styles';
import {
  ListItemText,
  listItemTextClasses,
  MenuItem,
  menuItemClasses,
} from '@mui/material';
import { propsChecker } from 'lib/helpers';

interface AppMenuItemStyleProps {
  $minWidth?: number;
  $maxWidth?: number;
}

interface AppListItemTextProps {
  $removeTextStyles?: boolean;
}

export const StyledAppMenuItem = styled(MenuItem, {
  shouldForwardProp: propsChecker,
})<AppMenuItemStyleProps>(({ theme, $minWidth, $maxWidth }) => ({
  [`&.${menuItemClasses.root}`]: {
    '&:hover': {
      backgroundColor: theme.palette.backgrounds.primary,
    },

    minWidth: $minWidth ? `${$minWidth}px` : 0,
    maxWidth: $maxWidth ? `${$maxWidth}px` : 'none',
  },
  [`&.${menuItemClasses.divider}`]: {
    padding: 0,
  },
}));

export const StyledAppListItemText = styled(ListItemText, {
  shouldForwardProp: propsChecker,
})<AppListItemTextProps>(({ theme, $removeTextStyles }) => ({
  [`&.${listItemTextClasses.root}`]: !$removeTextStyles && {
    display: 'inline',
    '& span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      fontWeight: theme.typography.body1.fontWeight,
    },
  },
}));
