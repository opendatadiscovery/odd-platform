import styled from 'styled-components';
import { AppPaper } from 'components/shared/elements';

export const Container = styled(AppPaper)(({ theme }) => ({
  '& > *': { padding: theme.spacing(2) },
  '& > * + *': {
    borderTop: '1px solid',
    borderTopColor: theme.palette.divider,
  },
  '& + &': { marginTop: theme.spacing(2) },
}));

export const DefinitionContainer = styled(AppPaper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: `${theme.spacing(2)}`,
}));
