import { Grid } from '@mui/material';
import { ColType, colWidthStyles } from 'components/Search/Results/ResultsStyles';
import styled from 'styled-components';

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({
  ...colWidthStyles.col,
  ...colWidthStyles[$colType],
}));
