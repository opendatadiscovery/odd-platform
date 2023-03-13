import { Grid } from '@mui/material';
import styled, { type CSSObject } from 'styled-components';

export const ActionsContainer = styled(Grid)(
  () =>
    ({
      justifyContent: 'flex-end',
      flexWrap: 'nowrap',
      opacity: 0,
    } as CSSObject)
);

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  flexWrap: 'nowrap',
  alignItems: 'center',
  '& > *': { padding: theme.spacing(0, 1) },
  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${ActionsContainer}`]: { opacity: 1 },
  },
}));
