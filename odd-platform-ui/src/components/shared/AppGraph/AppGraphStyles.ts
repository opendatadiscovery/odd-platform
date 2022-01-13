import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'inherit',
  backgroundColor: theme.palette.backgrounds.primary,
  fontSize: '0.6rem',
  position: 'relative',
}));

export const LoaderContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'inherit',
  backgroundColor: theme.palette.backgrounds.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ActionsContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: theme.spacing(1),
  display: 'inline-flex',
  alignItems: 'center',
  '& > * + *': {
    marginLeft: theme.spacing(1),
  },
}));

export const Layer = styled('svg')(() => ({
  width: '100%',
  height: '100vh',
}));
