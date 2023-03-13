import styled, { type CSSObject } from 'styled-components';
import { Box } from '@mui/material';

export const CaptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2.25),
}));

export const TagsContainer = styled(Box)(
  () =>
    ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
    } as CSSObject)
);
