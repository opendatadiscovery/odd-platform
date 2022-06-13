import styled from 'styled-components';

export const Path = styled('path')(({ theme }) => ({
  fill: 'none',
  stroke: theme.palette.texts.hint,
  strokeWidth: 2,
}));

export const Arrow = styled('path')(({ theme }) => ({
  fill: theme.palette.texts.hint,
}));
