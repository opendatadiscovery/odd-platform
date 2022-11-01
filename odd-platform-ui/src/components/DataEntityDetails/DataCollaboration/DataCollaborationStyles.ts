import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  position: 'relative',
  flexWrap: 'nowrap',
}));
