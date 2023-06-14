import { maxContentWidthWithoutSidebar } from 'lib/constants';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  margin: '0 auto',
  padding: theme.spacing(2),
  width: `${maxContentWidthWithoutSidebar}px`,
  [theme.breakpoints.down(maxContentWidthWithoutSidebar)]: {
    width: '100%',
    maxWidth: `${maxContentWidthWithoutSidebar}px`,
  },
}));
