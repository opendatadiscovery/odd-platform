import styled from 'styled-components';

interface CrossLinkProps {
  $crossLink?: boolean;
}

export const Path = styled('path')<CrossLinkProps>(
  ({ theme, $crossLink }) => ({
    fill: 'none',
    stroke: $crossLink
      ? theme.palette.button.primaryLight.active.background
      : theme.palette.texts.hint,
    strokeWidth: 1,
  })
);

export const Arrow = styled('path')<CrossLinkProps>(
  ({ theme, $crossLink }) => ({
    fill: $crossLink
      ? theme.palette.button.primaryLight.active.background
      : theme.palette.texts.hint,
  })
);
