import styled from 'styled-components';
import { Typography } from '@mui/material';

const paramsHeight = 220;

export const Params = styled(Typography)<{
  $isOpened: boolean;
  $isExpandable: boolean;
}>(({ theme, $isOpened, $isExpandable }) => ({
  marginTop: theme.spacing(1.25),
  whiteSpace: 'pre-wrap',
  maxHeight: $isOpened ? 'none' : `${paramsHeight}px`,
  overflowY: 'hidden',
  position: 'relative',
  '&::after': {
    content: $isExpandable ? '""' : '',
    display: $isOpened ? 'none' : 'block',
    position: 'absolute',
    width: '100%',
    height: `${paramsHeight / 7}px`,
    bottom: 0,
    background: $isOpened
      ? 'transparent'
      : 'linear-gradient(180deg, transparent 0%, white 100%)',
  },
}));
