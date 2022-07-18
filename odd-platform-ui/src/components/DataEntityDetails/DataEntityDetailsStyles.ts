import { Grid } from '@mui/material';
import {
  maxContentWidthWithoutSidebar,
  toolbarHeight,
} from 'lib/constants';
import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  margin: '0 auto',
  padding: theme.spacing(2),
  width: `${maxContentWidthWithoutSidebar}px`,
  display: 'flex',
  flexDirection: 'column',
  minHeight: `calc(100vh - ${toolbarHeight}px - 4px)`,
  [theme.breakpoints.up(maxContentWidthWithoutSidebar)]: {
    width: '100%',
    maxWidth: `${maxContentWidthWithoutSidebar}px`,
  },
}));

export const InternalNameEditBtnContainer = styled('div')(() => ({
  display: 'none',
}));

export const Caption = styled(Grid)(() => ({
  '&:hover': {
    [`${InternalNameEditBtnContainer}`]: { display: 'block' },
  },
}));
