import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const OptionsBtnContainer = styled(Grid)(() => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  opacity: 0,
}));

export const RowInfo = styled(Grid)(({ theme }) => ({
  minHeight: '40px',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.backgrounds.primary,
  '& > *': {
    padding: theme.spacing(0.5, 0),
    alignItems: 'center',
  },
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${OptionsBtnContainer}`]: {
      opacity: 1,
    },
  },
}));

export const TypeContainer = styled(Grid)(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
}));

export const Divider = styled(Grid)(({ theme }) => ({
  borderRight: '1px solid',
  borderRightColor: theme.palette.backgrounds.primary,
}));
