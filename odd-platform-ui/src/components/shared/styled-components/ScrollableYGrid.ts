import { Grid } from '@mui/material';
import styled, { css } from 'styled-components';

export const ScrollableYGrid = styled(Grid)(
  () => css`
    overflow-y: scroll;
  `
);
