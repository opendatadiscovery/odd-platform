import styled from 'styled-components';
import type { GridProps } from '@mui/material';
import { Grid } from '@mui/material';

export const HeaderContainer = styled(Grid)<GridProps>(() => ({
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'nowrap',
}));

export const TitleContainer = styled(Grid)<GridProps>(() => ({
  width: 'auto',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}));

export const FormContainer = styled('form')(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(1.25),
}));

export const ActionsContainer = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
}));
