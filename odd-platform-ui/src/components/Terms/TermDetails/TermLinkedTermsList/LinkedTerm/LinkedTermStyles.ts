import type { GridProps } from '@mui/material';
import { Grid } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { colWidthStyles } from '../LinkedTermsListSkeleton/LinkedTermsListSkeletonStyles';

export const Container = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  padding: theme.spacing(1.25, 0),
  textDecoration: 'none',
  cursor: 'pointer',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
  },
}));

export const EntityLink = styled(Link)(() => ({
  color: 'initial',
  textDecoration: 'none',
  flexGrow: 1,
  overflow: 'hidden',
}));

export const NameContainer = styled(Grid)<GridProps>(() => ({
  ...colWidthStyles.col,
  padding: 0,
  justifyContent: 'flex-start',
  flexWrap: 'nowrap',
}));
