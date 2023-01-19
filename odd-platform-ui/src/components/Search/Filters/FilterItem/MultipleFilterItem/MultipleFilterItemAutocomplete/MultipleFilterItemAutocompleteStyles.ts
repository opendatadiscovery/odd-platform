import styled, { type CSSObject } from 'styled-components';

export const FilterCount = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
  marginLeft: theme.spacing(1),
}));

export const HighlightedTextPart = styled('span')<{
  isHighlighted: boolean;
}>(({ theme, isHighlighted }) => ({
  backgroundColor: isHighlighted ? theme.palette.warning.light : 'none',
}));

export const popperStyles: CSSObject = {
  width: 'fit-content !important',
  maxWidth: '400px',
  minWidth: '192px',
  marginTop: '4px !important',
};
