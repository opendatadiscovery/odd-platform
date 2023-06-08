import type { CSSObject } from 'styled-components';
import styled from 'styled-components';

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
    } as CSSObject)
);

export const Header = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const LogoContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const CountContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: '25%',
}));
