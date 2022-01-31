import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';

export const EditBtnContainer = styled(Grid)(() => ({
  visibility: 'hidden',
}));

export const Container = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'nowrap',
  padding: theme.spacing(1, 0),
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  '&:hover': {
    [`${EditBtnContainer}`]: { visibility: 'visible' },
  },
}));

export const ValueNameContainer = styled(Grid)(() => ({
  flex: '0 1 32%',
}));

export const ValueDescriptionContainer = styled(Grid)(() => ({
  flex: '1 1 68%',
}));
