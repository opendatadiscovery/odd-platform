import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  OwnerAssociationRequest,
  OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest,
  OwnerAssociationRequestStatus,
} from 'generated-sources';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { AcceptIcon, RejectIcon } from 'components/shared/Icons';
import { updateOwnerAssociationRequest } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import * as S from './AssociationRequestStyles';

interface Props {
  request: OwnerAssociationRequest;
}

const ActiveAssociationRequest: React.FC<Props> = ({ request }) => {
  const dispatch = useAppDispatch();
  const { id, ownerName, username } = request;

  const dispatchedRequest = (
    params: OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest
  ) => dispatch(updateOwnerAssociationRequest(params));

  const handleAccept = React.useCallback(
    () =>
      dispatchedRequest({
        ownerAssociationRequestId: id,
        ownerAssociationRequestStatusFormData: {
          status: OwnerAssociationRequestStatus.APPROVED,
        },
      }),
    [id]
  );

  const handleReject = React.useCallback(
    () =>
      dispatchedRequest({
        ownerAssociationRequestId: id,
        ownerAssociationRequestStatusFormData: {
          status: OwnerAssociationRequestStatus.DECLINED,
        },
      }),
    [id]
  );

  return (
    <S.Container container>
      <Grid item lg={4}>
        <Typography variant='body1' noWrap title={username}>
          {username}
        </Typography>
      </Grid>
      <Grid item lg={4}>
        <Typography variant='body1' noWrap title={ownerName}>
          {ownerName}
        </Typography>
      </Grid>
      <S.ActionsContainer container item lg={4}>
        <ConfirmationDialog
          actionTitle='Are you sure you want to accept association request?'
          actionName='Accept'
          actionText={<>{`User "${username}" will be map to owner "${ownerName}"`}</>}
          onConfirm={handleAccept}
          actionBtn={
            <AppButton size='medium' color='secondarySuccess' startIcon={<AcceptIcon />}>
              Accept
            </AppButton>
          }
        />
        <ConfirmationDialog
          actionTitle='Are you sure you want to reject association request?'
          actionName='Reject'
          actionText={`Association request to map user "${username}" to owner "${ownerName}" will be rejected`}
          onConfirm={handleReject}
          actionBtn={
            <AppButton
              sx={{ ml: 1 }}
              size='medium'
              color='secondaryWarn'
              startIcon={<RejectIcon />}
            >
              Reject
            </AppButton>
          }
        />
      </S.ActionsContainer>
    </S.Container>
  );
};

export default ActiveAssociationRequest;
