import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ActionsContainer = styled(Grid)(() => ({
  visibility: 'hidden',
}));

export const Container = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  alignItems: 'center',
  padding: theme.spacing(1.5, 1, 1.5, 1),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { visibility: 'visible' },
  },
}));
