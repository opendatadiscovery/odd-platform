import styled, { type CSSObject } from 'styled-components';

export const Wrapper = styled('div')<{ $cellCount: number }>(({ theme, $cellCount }) => {
  const lastChildCount = $cellCount % 2 === 0 ? 2 : 1;

  return {
    display: 'flex',
    flexWrap: 'nowrap',
    padding: theme.spacing(1.25, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    [`&:nth-last-child(-n+${lastChildCount})`]: {
      borderBottom: 'none',
      marginBottom: 0,
    },
  };
});

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    } as CSSObject)
);

export const ClassHeaderContainer = styled('div')(
  () =>
    ({
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
    } as CSSObject)
);

export const Header = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 0.5),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: '4px',
  '&:hover': { backgroundColor: theme.palette.backgrounds.tertiary },
  '&:active': { backgroundColor: theme.palette.backgrounds.primary },
}));

export const ClassLabelContainer = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(1),
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
  padding: theme.spacing(0, 0.25),
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
