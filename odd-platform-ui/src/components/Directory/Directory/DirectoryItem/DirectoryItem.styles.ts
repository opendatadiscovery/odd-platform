import styled, { type CSSObject } from 'styled-components';

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
      width: '160px',
      cursor: 'pointer',
    } as CSSObject)
);

export const LogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  height: '160px',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.backgrounds.tertiary,
  border: '1px solid',
  borderColor: theme.palette.border.light,
  borderRadius: '8px',

  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  '&:active': { backgroundColor: theme.palette.backgrounds.secondary },
}));

export const TextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(0.5),
}));
