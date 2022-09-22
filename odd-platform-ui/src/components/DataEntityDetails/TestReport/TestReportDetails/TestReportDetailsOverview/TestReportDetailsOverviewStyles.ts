import styled from 'styled-components';
import { Typography } from '@mui/material';

const paramsHeight = 220;

export const Params = styled(Typography)<{ $isExpandable: boolean }>(
  ({ theme, $isExpandable }) => ({
    marginTop: theme.spacing(1.25),
    whiteSpace: 'pre-wrap',
    maxHeight: `${paramsHeight}px`,
    overflowY: 'hidden',
    position: 'relative',
    '&::after': {
      content: '""',
      display: $isExpandable ? 'block' : 'none',
      position: 'absolute',
      width: '100%',
      height: `${paramsHeight / 7}px`,
      bottom: 0,
      background: 'linear-gradient(180deg, transparent 0%, white 100%)',
    },
  })
);
