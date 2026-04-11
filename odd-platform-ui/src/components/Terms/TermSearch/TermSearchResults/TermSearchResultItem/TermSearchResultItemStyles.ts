import { Grid } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const TermSearchResultsContainer = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  padding: theme.spacing(1.25, 0),
  textDecoration: 'none',
  cursor: 'pointer',
  alignItems: 'center',
  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
}));

export const TermSearchResultsItemLink = styled(Link)(() => ({
  color: 'initial',
  textDecoration: 'none',
  flexGrow: 1,
  overflow: 'hidden',
}));
