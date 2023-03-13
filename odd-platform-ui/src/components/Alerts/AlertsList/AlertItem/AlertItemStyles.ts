import { Grid } from '@mui/material';
import styled, { type CSSObject } from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  height: 'fit-content',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

export const Wrapper = styled(Grid)<{ $alignItems?: CSSObject['alignItems'] }>(
  ({ $alignItems = 'center' }) =>
    ({
      flexWrap: 'nowrap',
      alignItems: $alignItems,
      justifyContent: 'flex-end',
    } as CSSObject)
);
