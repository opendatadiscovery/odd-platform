import { Grid, GridProps } from '@mui/material';
import styled from 'styled-components';
import { AppButton } from 'components/shared';

export const Button = styled(AppButton)<{ $showBtn?: boolean }>(
  ({ $showBtn }) => ({
    opacity: $showBtn ? 1 : 0,
  })
);

export const RowContainer = styled(Grid)<{
  $offset: number;
  $rowHeight?: string | number;
}>(({ theme, $offset, $rowHeight }) => ({
  flexWrap: 'nowrap',
  position: 'relative',

  '&:hover': {
    backgroundColor: theme.palette.backgrounds.primary,
    [`${Button}`]: { opacity: 1 },
  },

  '&::after': {
    display: 'block',
    position: 'absolute',
    content: '""',
    width: `calc(100% - ${$offset + 8}px)`,
    borderBottom: `1px solid ${theme.palette.backgrounds.primary}`,
    marginLeft: `${$offset + 8}px`,
    top: $rowHeight,
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

export const RowInfoHeader = styled(Grid)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(0.25, 0),
  alignItems: 'center',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
}));

export const RowInfoHeaderActions = styled(Grid)<GridProps>(() => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  justifyContent: 'flex-end',
}));
