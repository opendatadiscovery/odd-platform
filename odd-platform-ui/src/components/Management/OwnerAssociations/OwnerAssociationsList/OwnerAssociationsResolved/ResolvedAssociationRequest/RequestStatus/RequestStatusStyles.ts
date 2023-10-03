import styled from 'styled-components';
import { Typography } from '@mui/material';
import { type OwnerAssociationRequestStatus } from 'generated-sources';

export const Container = styled(Typography)<{
  $status: OwnerAssociationRequestStatus;
}>(({ theme, $status }) => ({
  width: 'fit-content',
  padding: theme.spacing(0.25, 1),
  borderRadius: '12px',
  border: `1px solid ${theme.palette.associationRequestStatus[$status].border}`,
  backgroundColor: theme.palette.associationRequestStatus[$status].background,
}));
