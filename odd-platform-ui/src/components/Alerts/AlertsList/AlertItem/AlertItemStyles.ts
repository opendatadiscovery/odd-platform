import { Grid } from '@mui/material';
import styled from 'styled-components';

export const OptionsBtn = styled(Grid)(() => ({
  opacity: 0,
}));

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.25, 0),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${OptionsBtn}`]: { opacity: 1 },
  },
}));

export const NameContainer = styled('div')(() => ({
  overflow: 'auto',
}));

export const TypesContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
}));
