import styled from 'styled-components';
import { Grid } from '@mui/material';
import { CSSObject } from 'theme/interfaces';
import { AlertIcon, ClearIcon } from 'components/shared/Icons';

export const Container = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  padding: theme.spacing(4),
}));

export const PendingContainer = styled(Grid)<CSSObject>(() => ({
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

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
