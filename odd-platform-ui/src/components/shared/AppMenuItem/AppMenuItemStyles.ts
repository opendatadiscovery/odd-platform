import { styled } from '@mui/material/styles';
import {
  ListItemText,
  listItemTextClasses,
  MenuItem,
  menuItemClasses,
} from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { propsChecker } from 'lib/helpers';

interface AppMenuItemStyleProps {
  $minWidth?: number;
  $maxWidth?: number;
}

interface AppListItemTextProps {
  $removeTextStyles: boolean;
  $fontVariant: Variant;
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
})<AppListItemTextProps>(({ theme, $removeTextStyles, $fontVariant }) => ({
  [`& span`]: {
    fontSize: theme.typography[$fontVariant].fontSize,
    lineHeight: theme.typography[$fontVariant].lineHeight,
    fontWeight: theme.typography[$fontVariant].fontWeight,
  },
  [`&.${listItemTextClasses.root}`]: !$removeTextStyles && {
    display: 'inline',
    '& span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
}));
