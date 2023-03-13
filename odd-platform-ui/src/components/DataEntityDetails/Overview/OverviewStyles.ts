import AppPaper from 'components/shared/AppPaper/AppPaper';
import styled from 'styled-components';

export const SectionContainer = styled(AppPaper)(({ theme }) => ({
  '& > *': { padding: theme.spacing(2) },
  '& > * + *': { borderTop: `1px solid ${theme.palette.divider}` },
  '& + &': { marginTop: theme.spacing(2) },
}));
