import type { CSSObject } from 'styled-components';
import styled from 'styled-components';

export const ActionsContainer = styled('div')(() => ({
  opacity: 0,
}));

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(0.75),
  border: `1px solid`,
  borderRadius: `4px`,
  borderColor: 'transparent',

  '&:hover': {
    borderColor: theme.palette.border.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));

export const ContentWrapper = styled('div')(
  () =>
    ({
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
    } as CSSObject)
);

export const ContentContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  marginRight: theme.spacing(1),
}));
