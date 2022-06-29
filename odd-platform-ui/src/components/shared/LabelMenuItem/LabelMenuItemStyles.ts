import { ListItemText } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import styled from 'styled-components';

interface AppMenuItemStyleProps {
  $minWidth?: number;
  $maxWidth?: number;
}

interface AppListItemTextProps {
  $fontVariant: Variant;
}

export const StyledLabelMenuItem = styled('div')<AppMenuItemStyleProps>(
  ({ $minWidth, $maxWidth }) => ({
    minWidth: $minWidth ? `${$minWidth}px` : 0,
    maxWidth: $maxWidth ? `${$maxWidth}px` : 'none',
    padding: '8px 16px',
  })
);

export const StyledLabelListItemText = styled(
  ListItemText
)<AppListItemTextProps>(({ theme, $fontVariant }) => ({
  [`& span`]: {
    fontSize: theme.typography[$fontVariant].fontSize,
    lineHeight: theme.typography[$fontVariant].lineHeight,
    fontWeight: theme.typography[$fontVariant].fontWeight,
  },
}));
