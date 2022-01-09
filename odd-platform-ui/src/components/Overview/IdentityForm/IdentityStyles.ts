import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { maxIdentityFormContentWidth } from 'lib/constants';

export const Container = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4.5, 3, 4, 3),
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '8px',
}));

export const FormContainer = styled('form')(({ theme }) => ({
  width: '100%',
  maxWidth: maxIdentityFormContentWidth,
  marginTop: theme.spacing(1.75),
}));

export const SuggestedOwnersContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: maxIdentityFormContentWidth,
  marginTop: theme.spacing(1),
}));

export const SuggestedOwnerItem = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  padding: theme.spacing(0.25),
  marginTop: theme.spacing(0.75),
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    borderRadius: '4px',
    '& > *': {
      color: theme.palette.text.primary,
    },
  },
  '&:active': {
    backgroundColor: theme.palette.backgrounds.secondary,
  },
}));
