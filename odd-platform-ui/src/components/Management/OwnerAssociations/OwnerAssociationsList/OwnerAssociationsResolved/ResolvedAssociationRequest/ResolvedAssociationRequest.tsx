import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { OwnerAssociationRequest } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import RequestStatus from './RequestStatus/RequestStatus';
import * as S from '../../OwnerAssociationsSharedStyles';

interface Props {
  ownerName: OwnerAssociationRequest['ownerName'];
  username: OwnerAssociationRequest['username'];
  provider?: OwnerAssociationRequest['provider'];
  status: OwnerAssociationRequest['status'];
  role?: string;
  statusUpdatedBy: OwnerAssociationRequest['statusUpdatedBy'];
  statusUpdatedAt: OwnerAssociationRequest['statusUpdatedAt'];
}

const ResolvedAssociationRequest: React.FC<Props> = ({
  provider,
  username,
  status,
  statusUpdatedBy,
  statusUpdatedAt,
  ownerName,
  role,
}) => {
  const { associationRequestFormattedDateTime } = useAppDateTime();

  return (
    <S.AssociationsItemContainer container>
      <Grid item lg={2.5}>
        <Typography variant='body1' noWrap title={username}>
          {username}
        </Typography>
      </Grid>
      <Grid item lg={2}>
        <Typography variant='body1' noWrap title={ownerName}>
          {ownerName}
        </Typography>
      </Grid>
      <Grid item lg={1}>
        {role}
      </Grid>
      <Grid item lg={1.5}>
        <Typography variant='body1' noWrap title={provider}>
          {provider}
        </Typography>
      </Grid>
      <Grid item lg={1.5}>
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
