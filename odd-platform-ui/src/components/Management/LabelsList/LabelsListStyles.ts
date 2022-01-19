import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Caption = styled(Grid)(() => ({
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const TableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': {
    padding: theme.spacing(0, 1),
  },
}));
