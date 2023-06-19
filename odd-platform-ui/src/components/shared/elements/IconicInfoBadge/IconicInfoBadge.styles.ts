import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '249px',
  cursor: 'pointer',
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.backgrounds.tertiary,
  border: '1px solid',
  borderColor: theme.palette.border.light,
  borderRadius: '8px',
  padding: theme.spacing(1),
  paddingRight: theme.spacing(2),

  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  '&:active': { backgroundColor: theme.palette.backgrounds.secondary },

  [theme.breakpoints.down('lg')]: { width: '245px' },
  [theme.breakpoints.down('sm')]: { width: '205px' },
}));

export const NameContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
}));
