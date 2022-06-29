import { Menu, menuClasses } from '@mui/material';
import styled from 'styled-components';

interface LabelMenuStyleProps {
  $minWidth?: number;
  $maxWidth?: number;
  $maxHeight?: number;
}

export const StyledLabelMenu = styled(Menu)<LabelMenuStyleProps>(
  ({ theme, $maxHeight, $minWidth, $maxWidth }) => ({
    maxHeight: $maxHeight ? `${$maxHeight}px !important` : 'none',
    maxWidth: $maxWidth ? `${$maxWidth}px !important` : 'none',
    minWidth: $minWidth ? `${$minWidth}px !important` : 0,
    marginTop: '4px',
    [`&.${menuClasses.paper}`]: {
      padding: theme.spacing(1, 0),
      border: ' 1px solid',
      width: '300px',
      borderColor: theme.palette.backgrounds.secondary,
      borderRadius: '4px',
    },
  })
);
