import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { SEARCH_TABLE_MIN_WIDTH } from '../Results.styles';

export const Container = styled(Grid)(({ theme }) => ({
  minWidth: SEARCH_TABLE_MIN_WIDTH,
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  textDecoration: 'none',
  cursor: 'pointer',
  alignItems: 'center',
  flexWrap: 'nowrap',
  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  '& > *': { padding: theme.spacing(1.25, 1) },
}));

export const ItemLink = styled(Link)(() => ({
  color: 'initial',
  textDecoration: 'none',
  flexGrow: 1,
  overflow: 'hidden',
}));

export const NameContainer = styled(Grid)(({ theme }) => ({
  overflow: 'hidden',
  flexWrap: 'nowrap',
  paddingRight: theme.spacing(1),
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export const RCContainer = styled(Typography)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
