import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const ListContainer = styled('div')<{ $heightOffset?: number }>(
  ({ theme, $heightOffset }) => ({
    height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
      $heightOffset || 8
    )})`,
    overflow: 'auto',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    width: '100%',
  })
);
