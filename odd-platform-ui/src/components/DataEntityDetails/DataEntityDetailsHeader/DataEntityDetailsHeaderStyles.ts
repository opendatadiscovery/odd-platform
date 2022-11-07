import styled, { CSSObject } from 'styled-components';
import { Grid } from '@mui/material';

export const InternalNameEditBtnContainer = styled(Grid)(
  () => ({ visibility: 'hidden' } as CSSObject)
);

export const Caption = styled(Grid)(
  () =>
    ({
      width: '100%',
      '&:hover': { [`${InternalNameEditBtnContainer}`]: { visibility: 'visible' } },
    } as CSSObject)
);
