import {
  ListItemText,
  listItemTextClasses,
  MenuItem,
  menuItemClasses,
} from '@mui/material';
import { type Variant } from '@mui/material/styles/createTypography';
import styled from 'styled-components';

interface AppMenuItemStyleProps {
  $minWidth?: number;
  $maxWidth?: number;
}

interface AppListItemTextProps {
  $removeTextStyles: boolean;
  $fontVariant: Variant;
}

export const StyledAppMenuItem = styled(MenuItem)<AppMenuItemStyleProps>(
  ({ theme, $minWidth, $maxWidth }) => ({
    [`&.${menuItemClasses.root}`]: {
      '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
      width: '100%',
      minWidth: $minWidth ? `${$minWidth}px` : 0,
      maxWidth: $maxWidth ? `${$maxWidth}px` : 'none',
    },
    [`&.${menuItemClasses.divider}`]: { padding: 0 },
  })
);

export const StyledAppListItemText = styled(ListItemText)<AppListItemTextProps>(
  ({ theme, $removeTextStyles, $fontVariant }) => ({
    [`& span`]: {
      fontSize: theme.typography[$fontVariant].fontSize,
      lineHeight: theme.typography[$fontVariant].lineHeight,
      fontWeight: theme.typography[$fontVariant].fontWeight,
    },
    [`&.${listItemTextClasses.root}`]: !$removeTextStyles
      ? {
          display: 'inline',
          '& span': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }
      : {},
  })
);
