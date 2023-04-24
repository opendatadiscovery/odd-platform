import styled from 'styled-components';
import { Box, Grid } from '@mui/material';

export const Icon = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.backgrounds.secondary,
  marginRight: theme.spacing(2),
}));

export const MenuItem = styled(Grid)<{ $last?: boolean }>(({ theme, $last }) => ({
  minWidth: '300px',
  padding: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  alignItems: 'center',
  flexWrap: 'nowrap',
  marginBottom: theme.spacing($last ? 0 : 0.5),
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${Icon}`]: { backgroundColor: theme.palette.backgrounds.secondary },
  },
  '&:active': {
    backgroundColor: theme.palette.backgrounds.secondary,
    [`${Icon}`]: { backgroundColor: theme.palette.backgrounds.primary },
  },
}));

export const LinksContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'column',
  paddingTop: theme.spacing(1),
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
}));
