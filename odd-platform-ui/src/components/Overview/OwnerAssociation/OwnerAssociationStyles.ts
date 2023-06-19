import styled, { type CSSObject } from 'styled-components';
import { Grid } from '@mui/material';
import { AlertIcon, ClearIcon } from 'components/shared/icons';

export const Container = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  padding: theme.spacing(4),
  width: '100%',
}));

export const PendingContainer = styled(Grid)(
  () =>
    ({
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    } as CSSObject)
);

export const RejectMsg = styled(Grid)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.backgrounds.primary,
  borderRadius: '2px',
  boxShadow: theme.shadows[8],
  flexWrap: 'nowrap',
}));

export const RejectIcon = styled(ClearIcon)(({ theme }) => ({
  width: '25px',
  height: '25px',
  color: theme.palette.texts.primary,
}));

export const AlertIcn = styled(AlertIcon)(({ theme }) => ({
  '* > path': { fill: theme.palette.texts.primary },
  marginRight: theme.spacing(0.5),
}));
