import { Grid } from '@mui/material';
import styled from 'styled-components';
import { activitySidebarWidth } from 'lib/constants';

export const Container = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: `${activitySidebarWidth}px`,
  marginRight: theme.spacing(4),
}));
