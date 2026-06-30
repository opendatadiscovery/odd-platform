import { Grid } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { TERM_TABLE_MIN_WIDTH } from '../TermSearchResultsStyles';

export const TermSearchResultsContainer = styled(Grid)(({ theme }) => ({
  minWidth: TERM_TABLE_MIN_WIDTH,
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  padding: theme.spacing(1.25, 0),
  textDecoration: 'none',
  cursor: 'pointer',
  alignItems: 'center',
  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
}));

export const TermSearchResultsItemLink = styled(Link)(() => ({
  display: 'block',
  minWidth: TERM_TABLE_MIN_WIDTH,
  color: 'initial',
  textDecoration: 'none',
  flexGrow: 1,
}));
