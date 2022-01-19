import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const TruncatedList = styled('div')(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(0.5),
  '& > *': {
    margin: theme.spacing(0.75, 0.25),
  },
}));

export const LinkContent = styled(Typography)(() => ({
  borderRadius: 'inherit',
  letterSpacing: 'inherit',
  fontWeight: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  color: 'inherit',
}));
