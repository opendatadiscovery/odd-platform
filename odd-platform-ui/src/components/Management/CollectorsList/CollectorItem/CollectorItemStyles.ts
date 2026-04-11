import styled from 'styled-components';
import { AppPaper } from 'components/shared/elements';

export const Actions = styled('div')(() => ({
  opacity: 0,
  display: 'flex',
  justifyContent: 'flex-end',
}));

export const Description = styled('div')(({ theme }) => ({
  width: '100%',
  '& > *': { marginBottom: theme.spacing(1) },
  '& > *:last-child': { marginBottom: theme.spacing(0) },
}));

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1.5),
}));

export const Container = styled(AppPaper)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',

  '&:hover': {
    boxShadow: theme.shadows[8],
    [`${Actions}`]: { opacity: 1 },
  },
}));
