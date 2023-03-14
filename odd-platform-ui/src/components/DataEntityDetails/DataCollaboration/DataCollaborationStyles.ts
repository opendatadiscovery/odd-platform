import styled, { type CSSObject } from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(
  () =>
    ({
      position: 'relative',
      flexWrap: 'nowrap',
    } as CSSObject)
);
