import { Grid } from '@mui/material';
import styled from 'styled-components';
import { ColType, colWidthStyles } from '../ResultsStyles';

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({
  ...colWidthStyles.col,
  ...colWidthStyles[$colType],
}));
