import styled from 'styled-components';

export const TermLink = styled('a')(({ theme }) => ({
  borderRadius: '2px !important',
  padding: `${theme.spacing(0, 0.25)} !important`,
  textDecoration: 'none !important',
  backgroundColor: `${theme.palette.attachment.normal.background} !important`,
  color: `${theme.palette.attachment.normal.color} !important`,

  '&:hover': {
    textDecoration: 'none !important',
    backgroundColor: `${theme.palette.attachment.hover.background} !important`,
    color: `${theme.palette.attachment.hover.color} !important`,
  },

  '&:active': {
    backgroundColor: `${theme.palette.attachment.active.background} !important`,
    color: `${theme.palette.attachment.active.color} !important`,
  },
}));
