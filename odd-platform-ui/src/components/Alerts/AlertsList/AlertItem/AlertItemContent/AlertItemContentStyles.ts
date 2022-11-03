import { Grid } from '@mui/material';
import styled from 'styled-components';
import { CSSObject } from 'theme/interfaces';

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
  width: '100%',
  cursor: 'pointer',
}));

export const TypesContainer = styled('div')<CSSObject>(() => ({
  display: 'flex',
  flexWrap: 'nowrap',
}));
