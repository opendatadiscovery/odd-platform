import { Grid } from '@mui/material';
import {
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';
import styled from 'styled-components';
import {
  TermSearchResultsColType,
  termSearchResultsColWidthStyles,
} from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';

const itemHeight = 40;

export const TermLinkedItemsResultsTableHeader = styled(Grid)(
  ({ theme }) => ({
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
  })
);

export const TermLinkedItemsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));

export const TermLinkedItemsListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${itemHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflow: 'auto',
}));
