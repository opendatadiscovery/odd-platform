import styled from 'styled-components';

export const NodeContainer = styled('g')(({ theme }) => ({
  fill: theme.palette.background.default,
  rx: 2,
  '&:hover': {
    '-webkit-filter': `drop-shadow(${theme.shadows[9]})`,
    filter: `drop-shadow(${theme.shadows[9]})`,
  },
}));

export const RootNodeRect = styled('rect')<{ $parent: boolean }>(
  ({ theme, $parent }) => ({
    stroke: theme.palette.border.element,
    strokeWidth: $parent ? 0 : 1,
    rx: 8,
  })
);
