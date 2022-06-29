import { TypographyProps } from '@mui/material';
import styled from 'styled-components';

export const TruncatedList = styled('span')(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  marginLeft: theme.spacing(0.5),
  '& > *': {
    margin: theme.spacing(0, 0.25),
  },
}));

export const LinkContent = styled('div')<TypographyProps>(() => ({
  display: 'inline-flex',
}));
