import { Grid } from '@mui/material';
import styled from 'styled-components';
import { nestingFactor } from '../../../../shared/constants';

export const CollapseContainer = styled('div')<{ $visibility: boolean }>(
  ({ $visibility, theme }) => ({
    padding: theme.spacing(0.25, 0.5),
    display: 'flex',
    alignSelf: 'center',
    visibility: $visibility ? 'visible' : 'hidden',
  })
);

export const RowContainer = styled(Grid)<{
  $nesting: number;
  $rowHeight?: string | number;
  $isRowSelected: boolean;
}>(({ theme, $nesting, $rowHeight, $isRowSelected }) => ({
  flexWrap: 'nowrap',
  position: 'relative',
  backgroundColor: theme.palette.backgrounds[$isRowSelected ? 'primary' : 'default'],

  '&:hover': {
    backgroundColor: theme.palette.backgrounds.tertiary,
    cursor: 'pointer',
  },

  '&::after': {
    display: 'block',
    position: 'absolute',
    content: '""',
    width: `calc(100% - ${$nesting * nestingFactor}px)`,
    borderBottom: `1px solid ${theme.palette.backgrounds.primary}`,
    marginLeft: `${$nesting * nestingFactor}px`,
    top: $rowHeight,
    zIndex: 1,
    '&:last-child': {
      borderBottom: `1px solid ${theme.palette.backgrounds.primary}`,
    },
  },
}));

export const RowInfoWrapper = styled(Grid)<{
  $nesting: number;
}>(({ $nesting }) => ({
  flexWrap: 'nowrap',
  alignItems: 'baseline',
  paddingLeft: `${$nesting * nestingFactor}px`,
}));
