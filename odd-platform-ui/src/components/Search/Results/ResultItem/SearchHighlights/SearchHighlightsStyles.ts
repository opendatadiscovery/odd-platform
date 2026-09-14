import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  width: '640px',
  flexDirection: 'column',
  rowGap: theme.spacing(1),
}));

// ST-12: the marked spans are real <b> elements built by HighlightedText (never parsed HTML); `$pre` keeps a
// query example's SQL line breaks and gives it a monospace face.
export const HighlightText = styled(Typography)<{ $pre?: boolean }>(
  ({ theme, $pre }) => ({
    display: 'block',
    '& > b': { backgroundColor: theme.palette.warning.light, fontWeight: 400 },
    ...($pre
      ? {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'monospace',
          fontSize: '12px',
        }
      : {}),
  })
);

export const StateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.hint,
}));

export const OwnerItem = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0.5),
  borderBottom: '1px solid',
  borderColor: theme.palette.border.primary,
  marginBottom: theme.spacing(0.5),
  '&:last-child': { border: 'none', marginBottom: 0 },
}));

export const StructureItem = styled(Grid)(({ theme }) => ({
  paddingBottom: theme.spacing(0.25),
  borderBottom: '1px solid',
  borderColor: theme.palette.border.primary,
  marginBottom: theme.spacing(0.5),
  '&:last-child': { border: 'none', marginBottom: 0 },
}));
