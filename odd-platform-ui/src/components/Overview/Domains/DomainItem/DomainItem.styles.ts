import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '176px',
  height: '120px',
  alignItems: 'center',
  borderRadius: '8px',
  backgroundColor: theme.palette.backgrounds.tertiary,
  paddingTop: theme.spacing(2),

  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  '&:active': { backgroundColor: theme.palette.backgrounds.secondary },

  [theme.breakpoints.down('lg')]: { width: '173px' },
  [theme.breakpoints.down('sm')]: { width: '163px' },
}));

export const CountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '16px',
  width: '40px',
  height: '40px',
  backgroundColor: theme.palette.backgrounds.default,
  padding: theme.spacing(1.25),
}));
