import { styled } from '@mui/material/styles';

export const DelayText = styled('span')<{ component: React.ElementType }>(
  () => ({
    position: 'absolute',
    top: '-5px',
    right: '50px',
  })
);
