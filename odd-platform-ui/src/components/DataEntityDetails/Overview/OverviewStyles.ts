import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SectionContainer = styled(Paper)(({ theme }) => ({
  '& > *': {
    padding: theme.spacing(2),
  },
  '& > * + *': {
    borderTop: '1px solid',
    borderTopColor: theme.palette.divider,
  },
  '& + &': { marginTop: theme.spacing(2) },
}));
