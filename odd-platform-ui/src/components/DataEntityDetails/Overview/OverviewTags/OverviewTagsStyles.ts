import { styled } from '@mui/material/styles';

export const CaptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2.25),
}));

export const TagsContainer = styled('div')(({ theme }) => ({
  margin: theme.spacing(0, -0.5, 0, -0.5),
}));
