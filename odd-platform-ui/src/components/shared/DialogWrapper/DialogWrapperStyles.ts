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
import styled from 'styled-components';

export const MainDialog = styled(Dialog)<{
  $isLoading?: boolean;
}>(({ theme, $isLoading }) => ({
  [`& .${dialogClasses.paperWidthXs}`]: { maxWidth: '368px' },
  [`& .${dialogClasses.paperWidthSm}`]: { maxWidth: '420px' },
  [`& .${dialogClasses.paperWidthMd}`]: { maxWidth: '560px' },
  [`& .${dialogClasses.paperWidthLg}`]: {
    minHeight: '320px',
    maxWidth: '640px',
    maxHeight: '70vh',
  },
  [`& .${dialogClasses.paperWidthXl}`]: { maxWidth: '800px' },

  [`& .${dialogClasses.paper}`]: {
    border: ' 1px solid',
    borderColor: theme.palette.backgrounds.secondary,
    borderRadius: '4px',
  },

  pointerEvents: $isLoading ? 'none' : 'all',
}));

export const Title = styled(DialogTitle)<{
  $isLoading?: boolean;
}>(({ theme, $isLoading }) => ({
  [`&.${dialogTitleClasses.root}`]: {
    padding: theme.spacing(3, 3, 0.75, 3),
    paddingTop: theme.spacing($isLoading ? 2.5 : 3),
  },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export const Content = styled(DialogContent)(({ theme }) => ({
  [`&.${dialogContentClasses.root}`]: {
    padding: theme.spacing(0.75, 3, 1.75, 3),
  },
}));

export const Actions = styled(DialogActions)(({ theme }) => ({
  [`&.${dialogActionsClasses.root}`]: {
    padding: theme.spacing(1.75, 3, 3, 3),
  },
  flexWrap: 'wrap',
}));

export const Progress = styled(LinearProgress)<{
  $isLoading?: boolean;
}>(({ $isLoading }) => ({
  display: $isLoading ? 'block' : 'none',
}));

export const ErrorText = styled(Typography)(({ theme }) => ({
  flexBasis: '100%',
  marginBottom: theme.spacing(1),
}));
