import styled, { type CSSObject } from 'styled-components';

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
    } as CSSObject)
);

export const Header = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
    } as CSSObject)
);

export const HeaderContent = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
}));
