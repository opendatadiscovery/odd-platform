import { IconButton, iconButtonClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import { shouldForwardProp } from 'lib/helpers';

export type IconButtonColors =
  | 'primaryLight'
  | 'tertiary'
  | 'expand'
  | 'unfilled'
  | 'collapse';

export interface AppIconButtonStyleProps {
  $color: IconButtonColors;
  $open?: boolean;
}

export const StyledIconButton = styled(
  IconButton,
  shouldForwardProp(['$color'])
)<AppIconButtonStyleProps>(({ theme, $color, $open }) => ({
  [`&.${iconButtonClasses.sizeSmall}`]: {
    width: $color === 'expand' ? '21px' : '16px',
    height: '16px',
    padding: '3px',
    borderRadius: $color === 'collapse' ? '2px' : '4px',
  },
  [`&.${iconButtonClasses.sizeMedium}`]: {
    width: '24px',
    height: '24px',
    padding: '7px',
    borderRadius: '16px',
  },
  color: theme.palette.button[$color].normal.color,
  backgroundColor:
    theme.palette.button[$color].normal[$open ? 'border' : 'background'],
  '&:hover': {
    color: theme.palette.button[$color].hover?.color,
    backgroundColor:
      theme.palette.button[$color].hover?.[
        $open ? 'border' : 'background'
      ],
  },
  '&:active': {
    color: theme.palette.button[$color].active?.color,
    backgroundColor: theme.palette.button[$color].active?.background,
  },
  '&:disabled': {
    color: theme.palette.button[$color].disabled?.color,
    backgroundColor: theme.palette.button[$color].disabled?.background,
  },
}));
