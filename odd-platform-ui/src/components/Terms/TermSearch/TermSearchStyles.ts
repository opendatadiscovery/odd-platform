import { Grid } from '@mui/material';
import { maxSidebarWidth } from 'lib/constants';
import styled from 'styled-components';

export const TermSearchWrapper = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

export const TermSearchContentWrapper = styled(Grid)(({ theme }) => ({
  paddingLeft: `${maxSidebarWidth}px`,
  paddingRight: theme.spacing(2),
}));

export const TermSearchFiltersWrapper = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: `${maxSidebarWidth}px`,
  position: 'fixed',
  left: 0,
  paddingRight: theme.spacing(2),
}));

export const TermSearchResultsWrapper = styled(Grid)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: '100%',
  marginLeft: theme.spacing(1),
}));

export const TermSearchCaption = styled(Grid)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));
