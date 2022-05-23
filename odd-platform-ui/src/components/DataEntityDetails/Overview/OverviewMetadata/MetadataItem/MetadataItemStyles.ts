import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

export const LabelContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  overflow: 'hidden',
  marginTop: theme.spacing(1),
}));

export const Label = styled(Typography)(({ theme }) => ({
  wordBreak: 'break-word',
  maxHeight: '5rem',
  paddingRight: theme.spacing(1),
}));

export const EditForm = styled('form')(() => ({
  width: '100%',
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(0.5),
  border: '1px solid',
  borderColor: 'transparent',
  borderRadius: '4px',
  '&:hover': {
    borderColor: theme.palette.divider,
  },
}));

export const FormActionBtns = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  '& > * + *': {
    marginLeft: theme.spacing(0.5),
  },
}));

export const Actions = styled('div')(({ theme }) => ({
  opacity: 0,
  marginLeft: theme.spacing(0.5),
  display: 'flex',
}));

export const Container = styled(Grid)(() => ({
  alignItems: 'flex-start',
  '&:hover': {
    [`${Actions}`]: { opacity: 1 },
  },
}));

export const Value = styled('div')<{
  $isOpened: boolean;
}>(({ theme, $isOpened }) => ({
  margin: 0,
  whiteSpace: 'pre-wrap',
  maxHeight: $isOpened ? 'none' : '100px',
  overflowY: 'hidden',
  fontSize: theme.typography.body1.fontSize,
  lineHeight: theme.typography.body1.lineHeight,
  fontWeight: theme.typography.body1.fontWeight,
  fontFamily: theme.typography.body1.fontFamily,
}));

export const ValueLeftContainer = styled('div')(() => ({}));
