import styled from 'styled-components';
import { Grid, Typography } from '@mui/material';

export const LatestRunInfoContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& > *': {
    marginBottom: theme.spacing(0.75),
    '&:last-child': { marginBottom: theme.spacing(0) },
  },
}));

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
