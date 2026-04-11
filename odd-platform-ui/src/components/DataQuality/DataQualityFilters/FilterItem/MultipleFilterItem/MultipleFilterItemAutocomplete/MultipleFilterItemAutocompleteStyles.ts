import styled from 'styled-components';

export const FilterCount = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
}));

export const HighlightedTextPart = styled('span')<{
  isHighlighted: boolean;
}>(({ theme, isHighlighted }) => ({
  backgroundColor: isHighlighted ? theme.palette.warning.light : 'none',
}));
