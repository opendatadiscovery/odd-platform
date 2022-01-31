import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';

export const HeaderContainer = styled(Grid)(({ theme }) => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'nowrap',
}));

export const TitleContainer = styled(Grid)(({ theme }) => ({
  width: 'auto',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}));

export const FormContainer = styled('form')(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(1.25),
}));

export const ActionsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
}));
