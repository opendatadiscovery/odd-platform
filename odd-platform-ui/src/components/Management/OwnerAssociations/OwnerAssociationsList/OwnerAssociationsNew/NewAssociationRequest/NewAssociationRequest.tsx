import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  type OwnerAssociationRequest,
  OwnerAssociationRequestStatus,
  Permission,
} from 'generated-sources';
import { Button, ConfirmationDialog, OwnerRoleCell } from 'components/shared/elements';
import { AcceptIcon, RejectIcon } from 'components/shared/icons';
import { usePermissions, useUpdateAssociationRequest } from 'lib/hooks';
import * as S from '../../OwnerAssociationsSharedStyles';

interface NewAssociationRequestProps {
  id: OwnerAssociationRequest['id'];
  ownerName: OwnerAssociationRequest['ownerName'];
  username: OwnerAssociationRequest['username'];
  provider?: OwnerAssociationRequest['provider'];
  roles?: OwnerAssociationRequest['roles'];
}

const NewAssociationRequest: React.FC<NewAssociationRequestProps> = ({
  id,
  ownerName,
  username,
  provider,
  roles,
}) => {
  const { t } = useTranslation();
  const { hasAccessTo } = usePermissions();
  const { mutateAsync: updateOwnerAssociationRequest } = useUpdateAssociationRequest();

  const handleAccept = React.useCallback(async () => {
    await updateOwnerAssociationRequest({
      ownerAssociationRequestId: id,
      ownerAssociationRequestStatusFormData: {
        status: OwnerAssociationRequestStatus.APPROVED,
      },
    });
  }, [id]);

  const handleReject = React.useCallback(async () => {
    await updateOwnerAssociationRequest({
      ownerAssociationRequestId: id,
      ownerAssociationRequestStatusFormData: {
        status: OwnerAssociationRequestStatus.DECLINED,
      },
    });
  }, [id]);

  return (
    <S.AssociationsItemContainer container>
      <Grid item lg={2.5}>
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
        <OwnerRoleCell roles={roles} />
      </Grid>
      <Grid item lg={1.5}>
        {provider}
      </Grid>
      <S.AssociationsItemActionsContainer container item lg={3}>
        <ConfirmationDialog
          actionTitle={t('Are you sure you want to accept association request?')}
          actionName={t('Accept')}
          actionText={
            <>{`${t('User')} "${username}" ${t(
              'will be map to owner'
            )} "${ownerName}"`}</>
          }
          onConfirm={handleAccept}
          actionBtn={
            <Button
              text={t('Accept')}
              buttonType='secondarySuccess-m'
              startIcon={<AcceptIcon />}
              disabled={!hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE)}
            />
          }
        />
        <ConfirmationDialog
          actionTitle={t('Are you sure you want to reject association request?')}
          actionName={t('Reject')}
          actionText={`${t('Association request to map user')} "${username}" ${t(
            'to owner'
          )} "${ownerName}" ${t('will be rejected')}`}
          onConfirm={handleReject}
          actionBtn={
            <Button
              sx={{ ml: 1 }}
              text={t('Reject')}
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

export default NewAssociationRequest;
