import { Grid } from '@mui/material';
import {
  ColType,
  colWidthStyles,
} from 'components/Search/Results/ResultsStyles';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

export const ColContainer = styled(Grid, {
  shouldForwardProp: propsChecker,
})<{
  $colType: ColType;
}>(({ theme, $colType }) => ({
  ...colWidthStyles.col,
  ...colWidthStyles[$colType],
}));
