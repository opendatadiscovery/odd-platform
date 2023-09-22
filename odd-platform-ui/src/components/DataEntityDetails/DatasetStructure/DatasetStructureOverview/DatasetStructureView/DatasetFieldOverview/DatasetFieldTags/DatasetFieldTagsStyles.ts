import styled, { type CSSObject } from 'styled-components';
import { Box } from '@mui/material';

export const TagsContainer = styled(Box)(
  () =>
    ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
    } as CSSObject)
);
