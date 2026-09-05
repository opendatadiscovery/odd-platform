import { Grid } from '@mui/material';
import styled from 'styled-components';
import { toolbarHeight } from 'lib/constants';

export const Container = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 1, 1.5, 1),
}));

export const FacetsLoaderContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  justifyContent: 'center',
}));

// The rail is a fixed column: its content must scroll INSIDE this box, or a facet below the fold is unreachable
// (the eight-facet rail already touched the bottom of a 720px-high viewport; the Popularity control pushed
// past it, and a fixed, non-scrolling box cannot be scrolled by the page either — found by IT-156 case 8).
export const ListContainer = styled('div')(() => ({
  height: `calc(100vh - 110px - ${toolbarHeight}px)`,
  overflowY: 'auto',
  overflowX: 'hidden',
}));
