import styled, { type CSSObject } from 'styled-components';
import { Box, Popover, popoverClasses } from '@mui/material';

export const AppPopover = styled(Popover)(({ theme }) => ({
  [`&.${popoverClasses.root}`]: {
    [`& .${popoverClasses.paper}`]: {
      color: theme.palette.texts.info,
      borderRadius: '4px',
      padding: theme.spacing(1),
      border: '1px solid',
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.background.default,
    },
  },
}));

export const PopoverChildren = styled(Box)(
  () =>
    ({
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
    } as CSSObject)
);
