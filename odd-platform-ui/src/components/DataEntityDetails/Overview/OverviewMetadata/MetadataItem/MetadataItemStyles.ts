import { Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

export const Container = styled(Grid)(() => ({
  alignItems: 'center',
}));

export const LabelContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  overflow: 'hidden',
  marginTop: theme.spacing(1),
}));

export const Label = styled(Typography)(({ theme }) => ({
  wordBreak: 'break-word',
  maxHeight: '5rem',
  overflow: 'auto',
  paddingRight: theme.spacing(1),
}));

export const EditForm = styled('form')(() => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
}));

export const ValueContainer = styled('div')(({ theme }) => ({
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
  marginLeft: theme.spacing(1),
  '& > * + *': {
    marginLeft: theme.spacing(0.5),
  },
}));

export const Actions = styled('div', { shouldForwardProp: propsChecker })<{
  $hover: boolean;
}>(({ theme, $hover }) => ({
  opacity: $hover ? 1 : 0,
  marginLeft: theme.spacing(0.5),
  display: 'inline',
}));

export const Value = styled(Typography)(() => ({
  display: 'inline',
  wordBreak: 'break-word',
  maxHeight: '5rem',
  overflow: 'auto',
}));
