import type { CSSObject } from 'styled-components';
import styled from 'styled-components';
import { Grid } from '@mui/material';

export const Container = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  padding: theme.spacing(2),
  flexDirection: 'column',
}));

export const ContentContainer = styled(Grid)(
  () =>
    ({
      justifyContent: 'space-between',
      alignItems: 'baseline',
      flexWrap: 'nowrap',
      position: 'relative',
    } as CSSObject)
);

export const InfoContainer = styled('div')(
  () =>
    ({
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      position: 'absolute',
      right: 0,
    } as CSSObject)
);
