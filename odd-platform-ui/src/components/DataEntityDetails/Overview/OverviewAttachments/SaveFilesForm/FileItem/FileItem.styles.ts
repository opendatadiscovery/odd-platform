import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.backgrounds.tertiary,
  color: theme.palette.texts.hint,

  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
}));

export const ContentWrapper = styled('div')(() => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: '95%',
}));

export const ContentContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: 0,
  margin: theme.spacing(0, 1),
}));
