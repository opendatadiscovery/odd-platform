import { Grid } from '@mui/material';
import styled from 'styled-components';

export const TermSearchFilterCount = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
}));

export const TermSearchFilterHighlightedOption = styled('span')(
  ({ theme }) => ({
    backgroundColor: theme.palette.warning.light,
    borderRadius: '2px',
  })
);

export const TermSearchFilterSelectedOptionsContainer = styled(Grid)(
  ({ theme }) => ({
    display: 'inline-flex',
    flexWrap: 'wrap',
    margin: theme.spacing(0.25, -0.25),
  })
);
