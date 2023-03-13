import { Grid } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import type { ColType } from '../LinkedItemsListStyles';
import { colWidthStyles } from '../LinkedItemsListStyles';

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({ ...colWidthStyles.col, ...colWidthStyles[$colType] }));

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

export const ItemLink = styled(Link)(() => ({
  color: 'initial',
  textDecoration: 'none',
  flexGrow: 1,
  overflow: 'hidden',
}));
