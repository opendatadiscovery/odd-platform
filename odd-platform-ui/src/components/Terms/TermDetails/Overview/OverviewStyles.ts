import AppPaper from 'components/shared/elements/AppPaper/AppPaper';
import styled from 'styled-components';

export const SectionContainer = styled(AppPaper)(({ theme }) => ({
  '& > *': {
    padding: theme.spacing(2),
  },
  '& > * + *': {
    borderTop: '1px solid',
    borderTopColor: theme.palette.divider,
  },
  '& + &': { marginTop: theme.spacing(2) },
}));

export const SectionFlexContainer = styled(AppPaper)(({ theme }) => ({
  display: 'flex',
  padding: `${theme.spacing(2)}`,
  '& > *': {
    padding: `${theme.spacing(0.5)}`,
  },
}));
