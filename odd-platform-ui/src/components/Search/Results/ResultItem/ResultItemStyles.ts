import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

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

export const ItemLink = styled(Link)(({ theme }) => ({
  color: 'initial',
  textDecoration: 'none',
  flexGrow: 1,
  overflow: 'hidden',
}));
