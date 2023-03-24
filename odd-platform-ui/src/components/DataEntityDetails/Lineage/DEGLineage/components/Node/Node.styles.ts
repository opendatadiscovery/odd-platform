import styled, { type CSSObject } from 'styled-components';
import { Typography } from '@mui/material';
import { NODE_WIDTH } from '../../lib/constants';

export const Container = styled('div')<{
  $translateX?: number;
  $translateY?: number;
  $hidden?: boolean;
}>(({ $translateX, $translateY, $hidden, theme }) => ({
  position: 'absolute',
  transformOrigin: '0 0',
  transform: `translate(${$translateX || 0}px,${$translateY || 0}px)`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.backgrounds.default,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  width: `${NODE_WIDTH}px`,
  maxWidth: `${NODE_WIDTH}px`,

  visibility: $hidden ? 'hidden' : 'visible',

  cursor: 'default',
  border: `1px solid`,
  borderColor: 'transparent',

  '&:hover': {
    '-webkit-filter': `drop-shadow(${theme.shadows[9]})`,
    filter: `drop-shadow(${theme.shadows[9]})`,
    borderColor: theme.palette.border.element,
  },
}));

export const TitleContainer = styled(Typography)(
  () =>
    ({
      wordBreak: 'break-all',
      '&:hover': { cursor: 'pointer' },
    } as CSSObject)
);

export const SourceContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(1),
}));

export const ClassesContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  marginTop: theme.spacing(1),
}));

export const OddrnContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: theme.spacing(1),
}));
