import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const FilterCount = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
}));

export const HighlightedOption = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  borderRadius: '2px',
}));

export const SelectedOptionsContainer = styled(Grid)(({ theme }) => ({
  display: 'inline-flex',
  flexWrap: 'wrap',
  margin: theme.spacing(0.25, -0.25),
}));
