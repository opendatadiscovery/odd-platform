import styled from 'styled-components';
import { Grid } from '@mui/material';
import { CSSObject } from 'theme/interfaces';

export const Container = styled(Grid)<CSSObject>(() => ({
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
}));
