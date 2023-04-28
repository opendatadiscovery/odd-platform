import styled from 'styled-components';

export const OwnerActionBtns = styled('div')(() => ({ opacity: 0 }));

export const OwnerItem = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid',
  borderRadius: '5px',
  borderColor: 'transparent',
  padding: theme.spacing(0.5),
  '&:hover': {
    borderColor: theme.palette.border.element,
    [`${OwnerActionBtns}`]: { opacity: 1 },
  },
}));
