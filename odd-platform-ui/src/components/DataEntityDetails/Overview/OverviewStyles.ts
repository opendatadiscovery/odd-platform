import AppPaper from 'components/shared/elements/AppPaper/AppPaper';
import styled from 'styled-components';

export const SectionContainer = styled(AppPaper)(({ theme }) => ({
  '& > *': { padding: theme.spacing(1.5, 2) },
  '& + &': { marginTop: theme.spacing(2) },
}));
