import styled from 'styled-components';

export const Path = styled('path')(({ theme }) => ({
  fill: 'none',
  stroke: theme.palette.button.primaryLight.active.background,
  strokeWidth: 2,
}));

export const Arrow = styled('path')(({ theme }) => ({
  fill: theme.palette.button.primaryLight.active.background,
}));

export const Container = styled('g')(() => ({
  '&:hover': {
    [`${Path}`]: { strokeWidth: 3 },
  },
}));
