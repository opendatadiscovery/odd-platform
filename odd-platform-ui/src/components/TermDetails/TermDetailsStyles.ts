import { Grid } from '@mui/material';
import {
  maxContentWidthWithoutSidebar,
  toolbarHeight,
} from 'lib/constants';
import styled from 'styled-components';

export const TermDetailsWrapper = styled('div')(({ theme }) => ({
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

export const TermDetailsInternalNameEditBtnWrapper = styled('div')(() => ({
  display: 'none',
}));

export const TermDetailsCaption = styled(Grid)(() => ({
  '&:hover': {
    [`${TermDetailsInternalNameEditBtnWrapper}`]: { display: 'block' },
  },
}));

export const TermDetailsUpdatedAt = styled(Grid)(() => ({
  display: 'none',
}));
