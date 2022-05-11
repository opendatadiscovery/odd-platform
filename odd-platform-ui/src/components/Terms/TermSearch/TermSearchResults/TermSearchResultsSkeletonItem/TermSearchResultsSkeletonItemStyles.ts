import { Grid } from '@mui/material';
import {
  TermSearchResultsColType,
  termSearchResultsColWidthStyles,
} from 'components/Terms/TermSearch/TermSearchResults/TermSearchResultsStyles';
import styled from 'styled-components';

export const TermSearchResultsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));
