import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    13.125
  )})`,
  marginTop: theme.spacing(2),
}));
