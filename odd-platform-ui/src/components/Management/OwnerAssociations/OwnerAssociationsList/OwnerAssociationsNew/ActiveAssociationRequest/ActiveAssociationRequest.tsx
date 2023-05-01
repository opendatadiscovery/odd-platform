import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  type OwnerAssociationRequest,
  type OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest,
  OwnerAssociationRequestStatus,
  Permission,
} from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { AcceptIcon, RejectIcon } from 'components/shared/icons';
import { updateOwnerAssociationRequest } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { usePermissions } from 'lib/hooks';
import * as S from '../../OwnerAssociationsSharedStyles';

interface Props {
  id: OwnerAssociationRequest['id'];
  ownerName: OwnerAssociationRequest['ownerName'];
  username: OwnerAssociationRequest['username'];
  provider?: OwnerAssociationRequest['provider'];
}

const ActiveAssociationRequest: React.FC<Props> = ({
  id,
  ownerName,
  username,
  provider,
}) => {
  const dispatch = useAppDispatch();
  const { hasAccessTo } = usePermissions();

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
    <S.AssociationsItemContainer container>
      <Grid item lg={4}>
        <Typography variant='body1' noWrap title={username}>
          {username}
        </Typography>
      </Grid>
      <Grid item lg={2.5}>
        <Typography variant='body1' noWrap title={ownerName}>
          {ownerName}
        </Typography>
      </Grid>
      <Grid item lg={2.5}>
        {provider}
      </Grid>
      <S.AssociationsItemActionsContainer container item lg={3}>
        <ConfirmationDialog
          actionTitle='Are you sure you want to accept association request?'
          actionName='Accept'
          actionText={<>{`User "${username}" will be map to owner "${ownerName}"`}</>}
          onConfirm={handleAccept}
          actionBtn={
            <Button
              text='Accept'
              buttonType='secondarySuccess-m'
              startIcon={<AcceptIcon />}
              disabled={!hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)}
            />
          }
        />
        <ConfirmationDialog
          actionTitle='Are you sure you want to reject association request?'
          actionName='Reject'
          actionText={`Association request to map user "${username}" to owner "${ownerName}" will be rejected`}
          onConfirm={handleReject}
          actionBtn={
            <Button
              sx={{ ml: 1 }}
              text='Reject'
              buttonType='secondaryWarning-m'
              startIcon={<RejectIcon />}
              disabled={!hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)}
            />
          }
        />
      </S.AssociationsItemActionsContainer>
    </S.AssociationsItemContainer>
  );
};

export default ActiveAssociationRequest;
