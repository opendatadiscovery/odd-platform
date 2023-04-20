import styled from 'styled-components';
import { Avatar, avatarClasses } from '@mui/material';

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  [`&.${avatarClasses.root}`]: {
    width: '24px',
    height: '24px',

    [`&.${avatarClasses.rounded}`]: {
      borderRadius: theme.spacing(0.5),
      border: `1px solid ${theme.palette.border.primary}`,
    },
  },
}));
