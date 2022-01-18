import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  '& span span': {
    backgroundColor: theme.palette.backgrounds.primary,
    borderRadius: '4px',
    lineHeight: '1.1rem',
    color: theme.palette.texts.secondary,
  },
}));

export const HintContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '16px',
  marginLeft: theme.spacing(0.5),
  '& > span': { minWidth: '28px' },
}));
