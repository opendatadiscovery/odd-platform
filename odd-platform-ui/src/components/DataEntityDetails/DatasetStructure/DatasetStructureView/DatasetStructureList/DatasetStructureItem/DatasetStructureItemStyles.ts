import { Grid } from '@mui/material';
import styled from 'styled-components';
import { AppButton } from 'components/shared/elements';

export const Button = styled(AppButton)<{ $showBtn?: boolean }>(({ $showBtn }) => ({
  opacity: $showBtn ? 1 : 0,
}));

export const RowContainer = styled(Grid)<{
  $offset: number;
  $rowHeight?: string | number;
  $isRowSelected: boolean;
}>(({ theme, $offset, $rowHeight, $isRowSelected }) => ({
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
    width: `calc(100% - ${$offset}px)`,
    borderBottom: `1px solid ${theme.palette.backgrounds.primary}`,
    marginLeft: `${$offset}px`,
    top: $rowHeight,
    zIndex: 1,
    '&:last-child': {
      borderBottom: `1px solid ${theme.palette.backgrounds.primary}`,
    },
  },
}));

export const RowInfoWrapper = styled(Grid)<{
  $padOffset: number;
}>(({ $padOffset }) => ({
  flexWrap: 'nowrap',
  alignItems: 'baseline',
  paddingLeft: `${$padOffset}px`,
}));
