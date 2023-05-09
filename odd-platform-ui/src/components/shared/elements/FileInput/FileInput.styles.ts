import type { CSSObject } from 'styled-components';
import styled from 'styled-components';

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      flexDirection: 'column',
    } as CSSObject)
);

export const Input = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '64px',
  width: '100%',
  border: '1px solid',
  borderColor: theme.palette.fileInput.normal.border,
  backgroundColor: theme.palette.fileInput.normal.background,
  borderRadius: '8px',

  '&:hover': {
    borderColor: theme.palette.fileInput.hover.border,
    backgroundColor: theme.palette.fileInput.hover.background,
  },

  '&:active': {
    borderColor: theme.palette.fileInput.active.border,
    backgroundColor: theme.palette.fileInput.active.background,
  },
}));

export const InputContent = styled('div')(
  () =>
    ({
      display: 'flex',
      flexWrap: 'nowrap',
    } as CSSObject)
);
