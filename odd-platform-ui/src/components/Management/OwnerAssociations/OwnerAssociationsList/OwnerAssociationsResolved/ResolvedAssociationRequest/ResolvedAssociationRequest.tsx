import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { OwnerAssociationRequestActivity } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import { OwnerRoleCell } from 'components/shared/elements';
import RequestStatus from './RequestStatus/RequestStatus';
import * as S from '../../OwnerAssociationsSharedStyles';

interface Props {
  ownerName: OwnerAssociationRequestActivity['ownerName'];
  username: OwnerAssociationRequestActivity['username'];
  provider?: OwnerAssociationRequestActivity['provider'];
  status: OwnerAssociationRequestActivity['status'];
  roles?: OwnerAssociationRequestActivity['roles'];
  statusUpdatedBy: OwnerAssociationRequestActivity['statusUpdatedBy'];
  statusUpdatedAt: OwnerAssociationRequestActivity['statusUpdatedAt'];
}

const ResolvedAssociationRequest: React.FC<Props> = ({
  provider,
  username,
  status,
  statusUpdatedBy,
  statusUpdatedAt,
  ownerName,
  roles,
}) => {
  const { associationRequestFormattedDateTime } = useAppDateTime();

  return (
    <S.AssociationsItemContainer container>
      <Grid item lg={1.5}>
        <Typography variant='body1' noWrap title={username}>
          {username}
        </Typography>
      </Grid>
      <Grid item lg={1.5}>
        <Typography variant='body1' noWrap title={ownerName}>
          {ownerName}
        </Typography>
      </Grid>
      <Grid item lg={2}>
        <OwnerRoleCell roles={roles} />
      </Grid>
      <Grid item lg={1.5}>
        <Typography variant='body1' noWrap title={provider}>
          {provider}
        </Typography>
      </Grid>
      <Grid item lg={2}>
        <Typography
          variant='body1'
          noWrap
          title={statusUpdatedBy?.owner?.name || statusUpdatedBy?.identity.username}
        >
          {statusUpdatedBy?.owner?.name || statusUpdatedBy?.identity.username}
        </Typography>
      </Grid>
      <Grid item lg={1.5}>
        <RequestStatus status={status} />
      </Grid>
      <Grid item lg={2}>
        <Typography variant='body1' noWrap>
          {statusUpdatedAt &&
            associationRequestFormattedDateTime(statusUpdatedAt?.getTime())}
        </Typography>
      </Grid>
    </S.AssociationsItemContainer>
  );
};

export default ResolvedAssociationRequest;
