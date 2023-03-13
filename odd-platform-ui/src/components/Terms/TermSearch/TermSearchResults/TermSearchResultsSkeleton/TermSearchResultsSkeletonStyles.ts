import { Grid } from '@mui/material';
import styled from 'styled-components';
import {
  type TermSearchResultsColType,
  termSearchResultsColWidthStyles,
} from '../TermSearchResultsStyles';

export const TermSearchResultsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));
