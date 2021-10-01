import { IconButton, iconButtonClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

export type IconButtonColors =
  | 'primaryLight'
  | 'tertiary'
  | 'expand'
  | 'unfilled';

export interface AppIconButtonStyleProps {
  $color: IconButtonColors;
}

export const StyledIconButton = styled(
  IconButton
)<AppIconButtonStyleProps>(({ theme, $color }) => ({
  [`&.${iconButtonClasses.sizeSmall}`]: {
    width: $color === 'expand' ? '21px' : '16px',
    height: '16px',
    padding: '3px',
    borderRadius: '4px',
  },
  [`&.${iconButtonClasses.sizeMedium}`]: {
    width: '24px',
    height: '24px',
    padding: '7px',
    borderRadius: '16px',
  },
  '& .MuiSvgIcon-root': { width: $color === 'expand' ? '13px' : '16px' },
  color: theme.palette.button[$color].normal.color,
  backgroundColor: theme.palette.button[$color].normal.background,
  '&:hover': {
    color: theme.palette.button[$color].hover.color,
    backgroundColor: theme.palette.button[$color].hover.background,
  },
  '&:active': {
    color: theme.palette.button[$color].active.color,
    backgroundColor: theme.palette.button[$color].active.background,
  },
  '&:disabled': {
    color: theme.palette.button[$color].disabled?.color,
    backgroundColor: theme.palette.button[$color].disabled?.background,
  },
}));
