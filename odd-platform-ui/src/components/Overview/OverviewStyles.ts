import { Grid } from '@mui/material';
import { maxContentWidthWithoutSidebar, maxTagsContainerWidth } from 'lib/constants';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  overflowY: 'scroll',
  alignItems: 'center',

  margin: '0 auto',
  padding: theme.spacing(0, 9.75, 4, 9.75),
  width: `${maxContentWidthWithoutSidebar}px`,
  [theme.breakpoints.down(maxContentWidthWithoutSidebar + 1)]: {
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
