import { Grid } from '@mui/material';
import { maxContentWidthWithoutSidebar, maxTagsContainerWidth } from 'lib/constants';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  margin: '0 auto',
  padding: theme.spacing(0, 10),
  width: `${maxContentWidthWithoutSidebar}px`,
  [theme.breakpoints.down(maxContentWidthWithoutSidebar)]: {
    width: '100%',
    maxWidth: `${maxContentWidthWithoutSidebar}px`,
    justifyContent: 'center',
  },
}));

export const TagsContainer = styled(Grid)(() => ({
  maxWidth: `${maxTagsContainerWidth}px`,
  justifyContent: 'center',
  margin: '0 auto',
}));
