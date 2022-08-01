import { Typography } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ListLinksContainer = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  listStyle: 'none',
  '& li': {
    marginBottom: theme.spacing(1),
  },
}));

export const ListLink = styled(Link)(({ theme }) => ({
  overflow: 'hidden',
  padding: theme.spacing(0.25),
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: theme.palette.texts?.primary,
  flexWrap: 'nowrap',
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    borderRadius: '4px',
    '& > *': {
      color: theme.palette.texts?.primary,
    },
  },
  '&:active': {
    backgroundColor: theme.palette.backgrounds.secondary,
  },
}));

export const SectionCaption = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts?.primary,
  display: 'flex',
  alignItems: 'center',
  '& > svg ': {
    marginRight: theme.spacing(0.5),
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}));

export const DataEntityListContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.backgrounds.default,
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.backgrounds.secondary}`,
  borderRadius: theme.spacing(1),
}));
