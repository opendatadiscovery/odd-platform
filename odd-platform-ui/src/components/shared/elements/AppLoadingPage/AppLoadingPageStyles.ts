import styled, { type CSSObject } from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(
  () =>
    ({
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      overflow: 'auto',
    } as CSSObject)
);
