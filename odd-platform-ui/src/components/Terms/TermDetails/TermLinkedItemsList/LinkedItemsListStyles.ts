import { Grid } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import styled from 'styled-components';
import type { TermSearchResultsColType } from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';
import { termSearchResultsColWidthStyles } from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';

const itemHeight = 40;

export const TermLinkedItemsResultsTableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
}));

export const TermLinkedItemsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));

export const TermLinkedItemsListContainer = styled(Grid)<{ $isListEmpty: boolean }>(
  ({ theme, $isListEmpty }) => ({
    height: $isListEmpty
      ? 'auto'
      : `calc(100vh - ${toolbarHeight}px - ${itemHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
          13.25
        )})`,
    overflow: 'auto',
  })
);
