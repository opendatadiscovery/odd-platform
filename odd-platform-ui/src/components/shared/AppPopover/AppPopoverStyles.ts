import { styled } from '@mui/material/styles';
import { Popover, popoverClasses } from '@mui/material';

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
