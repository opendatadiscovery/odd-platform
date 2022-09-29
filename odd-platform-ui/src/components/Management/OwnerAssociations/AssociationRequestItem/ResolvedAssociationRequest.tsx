import React from 'react';
import { Grid, Typography } from '@mui/material';
import { OwnerAssociationRequest } from 'generated-sources';
import { format } from 'date-fns';
import { alertDateFormat } from 'lib/constants';
import RequestStatus from './RequestStatus/RequestStatus';
import * as S from './AssociationRequestStyles';

interface Props {
  request: OwnerAssociationRequest;
}

const ResolvedAssociationRequest: React.FC<Props> = ({ request }) => {
  const { ownerName, username, status, statusUpdatedBy, statusUpdatedAt } =
    request;

  return (
    <S.Container container>
      <Grid item lg={3}>
        <Typography variant="body1" noWrap title={username}>
          {username}
        </Typography>
      </Grid>
      <Grid item lg={3}>
        <Typography variant="body1" noWrap title={ownerName}>
          {ownerName}
        </Typography>
      </Grid>
      <Grid item lg={3}>
        <Typography
          variant="body1"
          noWrap
          title={
            statusUpdatedBy?.owner?.name ||
            statusUpdatedBy?.identity.username
          }
        >
          {statusUpdatedBy?.owner?.name ||
            statusUpdatedBy?.identity.username}
        </Typography>
      </Grid>
      <Grid item lg={1}>
        <RequestStatus status={status} />
      </Grid>
      <Grid item lg={2}>
        <Typography variant="body1" noWrap>
          {statusUpdatedAt && format(statusUpdatedAt, alertDateFormat)}
        </Typography>
      </Grid>
    </S.Container>
  );
};

export default ResolvedAssociationRequest;
