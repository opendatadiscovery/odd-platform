import { Grid } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import styled from 'styled-components';
import { ColType, colWidthStyles } from 'components/Search/Results/ResultsStyles';

const itemHeight = 40;

export const Container = styled(Grid)(() => ({}));
export const ResultsTableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
}));

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({
  ...colWidthStyles.col,
  ...colWidthStyles[$colType],
}));

export const ListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${itemHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflow: 'auto',
}));
