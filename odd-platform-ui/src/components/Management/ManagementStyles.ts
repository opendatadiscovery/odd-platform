import { Grid } from '@mui/material';
import { maxSidebarWidth } from 'lib/constants';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  paddingLeft: `${maxSidebarWidth + 16}px`,
}));

export const SidebarContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: `${maxSidebarWidth}px`,
  position: 'fixed',
  left: theme.spacing(2),
}));

export const ContentContainer = styled(Grid)(() => ({
  flexGrow: 1,
}));
