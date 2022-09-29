import { Grid } from '@mui/material';
import styled from 'styled-components';
import {
  TermSearchResultsColType,
  termSearchResultsColWidthStyles,
} from '../TermSearchResultsStyles';

export const TermSearchResultsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));
