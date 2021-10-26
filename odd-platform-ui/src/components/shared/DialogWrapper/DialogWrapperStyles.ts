import {
  Dialog,
  DialogActions,
  dialogActionsClasses,
  dialogClasses,
  DialogContent,
  dialogContentClasses,
  DialogTitle,
  dialogTitleClasses,
  LinearProgress,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';

export const closeButton = { ml: 1 };

export const StyledDialog = styled(Dialog, {
  shouldForwardProp: propsChecker,
})<{
  $isLoading?: boolean;
}>(({ theme, $isLoading }) => ({
  [`& .${dialogClasses.paperWidthXs}`]: { maxWidth: '368px' },
  pointerEvents: $isLoading ? 'none' : 'all',
}));

export const StyledDialogTitle = styled(DialogTitle, {
  shouldForwardProp: propsChecker,
})<{
  $isLoading?: boolean;
}>(({ theme, $isLoading }) => ({
  [`&.${dialogTitleClasses.root}`]: {
    padding: theme.spacing(3, 3, 0.75, 3),
    paddingTop: theme.spacing($isLoading ? 2.5 : 3),
  },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  [`&.${dialogContentClasses.root}`]: {
    padding: theme.spacing(0.75, 3, 1.75, 3),
  },
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  [`&.${dialogActionsClasses.root}`]: {
    padding: theme.spacing(1.75, 3, 3, 3),
  },
  flexWrap: 'wrap',
}));

export const StyledProgress = styled(LinearProgress, {
  shouldForwardProp: propsChecker,
})<{
  $isLoading?: boolean;
}>(({ theme, $isLoading }) => ({
  display: $isLoading ? 'block' : 'none',
}));

export const ErrorText = styled(Typography)(({ theme }) => ({
  flexBasis: '100%',
  marginBottom: theme.spacing(1),
}));
