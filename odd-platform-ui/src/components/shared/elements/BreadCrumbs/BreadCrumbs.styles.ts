import styled from 'styled-components';
import { Typography } from '@mui/material';

export const Container = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

export const Active = styled(Typography)(({ theme }) => ({
  '&:hover': { color: theme.palette.texts.info },
  '&:active': { color: theme.palette.texts.primary },
}));
