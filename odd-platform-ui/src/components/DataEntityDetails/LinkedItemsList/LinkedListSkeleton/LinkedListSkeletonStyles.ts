import { Grid } from '@mui/material';
import styled from 'styled-components';
import { colWidthStyles, type ColType } from '../LinkedItemsListStyles';

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({
  ...colWidthStyles.col,
  ...colWidthStyles[$colType],
}));
