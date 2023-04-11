import type { CSSObject } from 'styled-components';
import styled from 'styled-components';

export const Wrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  padding: theme.spacing(0.5),
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': { border: 'none', marginBottom: 0 },
}));

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    } as CSSObject)
);

export const Header = styled('div')(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: '4px',
  h2: { lineHeight: theme.spacing(4) },
  '&:hover': { backgroundColor: theme.palette.backgrounds.tertiary },
  '&:active': { backgroundColor: theme.palette.backgrounds.primary },
}));

export const ClassLabelContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(0.25),
  width: '12%',
  minWidth: 'fit-content',
}));

export const TypeListContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginLeft: theme.spacing(0.5),
}));

export const TypeItem = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0.5),
  marginRight: theme.spacing(1),
  borderRadius: '4px',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': { backgroundColor: theme.palette.backgrounds.primary },
  '&:active': { backgroundColor: theme.palette.backgrounds.secondary },

  '&::after': {
    content: '""',
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: theme.palette.backgrounds.secondary,
    right: '-6px',
    top: '42%',
  },

  '&:last-child': { '&::after': { display: 'none' } },
}));
