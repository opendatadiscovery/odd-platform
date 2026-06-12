import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import type { TermSearchResultsColType } from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';
import { termSearchResultsColWidthStyles } from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';

const itemHeight = 40;

export const TermLinkedTermsResultsTableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
}));

export const TermLinkedTermsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));

export const TermLinkedTermsListContainer = styled(Grid)<{ $isListEmpty: boolean }>(
  ({ theme, $isListEmpty }) => ({
    height: $isListEmpty
      ? 'auto'
      : `calc(100vh - ${toolbarHeight}px - ${itemHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
          13.25
        )})`,
    overflow: 'auto',
  })
);
