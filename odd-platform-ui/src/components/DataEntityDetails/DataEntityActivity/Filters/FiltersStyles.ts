import { Grid } from '@mui/material';
import { activitySidebarWidth } from 'lib/constants';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: `${activitySidebarWidth}px`,
  marginRight: theme.spacing(4),
}));
