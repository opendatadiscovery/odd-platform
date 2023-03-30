import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1),
  flexGrow: 1,
}));

export const Header = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  borderRadius: '4px',
  h2: { lineHeight: theme.spacing(4) },
  '&:hover': { backgroundColor: theme.palette.backgrounds.tertiary },
  '&:active': { backgroundColor: theme.palette.backgrounds.primary },
}));

export const TypeListContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& > *': { marginBottom: theme.spacing(0.25) },
}));

export const TypeItem = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0.5, 1),
  borderRadius: '4px',
  cursor: 'pointer',
  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  '&:active': { backgroundColor: theme.palette.backgrounds.secondary },
}));
