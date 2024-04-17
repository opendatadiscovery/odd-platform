import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Permission, type OwnerAssociationRequest } from 'generated-sources';
import { useAppDateTime, usePermissions, useRemoveUserOwnerMapping } from 'lib/hooks';
import { Button, ConfirmationDialog, OwnerRoleCell } from 'components/shared/elements';
import { RejectIcon } from 'components/shared/icons';
import { useTranslation } from 'react-i18next';
import * as S from '../../OwnerAssociationsSharedStyles';

interface ActiveAssociationRequestProps {
  ownerName: OwnerAssociationRequest['ownerName'];
  ownerId: OwnerAssociationRequest['ownerId'];
  username: OwnerAssociationRequest['username'];
  provider?: OwnerAssociationRequest['provider'];
  roles?: OwnerAssociationRequest['roles'];
  statusUpdatedBy: OwnerAssociationRequest['statusUpdatedBy'];
  statusUpdatedAt: OwnerAssociationRequest['statusUpdatedAt'];
}

const ActiveAssociationRequest: React.FC<ActiveAssociationRequestProps> = ({
  provider,
  username,
  roles,
  statusUpdatedBy,
  statusUpdatedAt,
  ownerName,
  ownerId,
}) => {
  const { associationRequestFormattedDateTime } = useAppDateTime();
  const { t } = useTranslation();
  const { hasAccessTo } = usePermissions();
  const { mutateAsync: deleteAssociation } = useRemoveUserOwnerMapping();

  const handleDelete = async () => {
    if (!ownerId) return;
    await deleteAssociation({
      ownerId,
    });
  };

  return (
    <S.AssociationsItemContainer container>
      <Grid item lg={2}>
        <Typography variant='body1' noWrap title={username}>
          {username}
        </Typography>
      </Grid>
      <Grid item lg={2}>
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
        <Typography variant='body1' noWrap>
          {statusUpdatedAt &&
            associationRequestFormattedDateTime(statusUpdatedAt?.getTime())}
        </Typography>
      </Grid>
      <S.AssociationsItemActionsContainer container item lg={1.5}>
        <ConfirmationDialog
          actionTitle='Are you sure you want to remove the association?'
          actionName='Remove'
          actionText={
            <>{`${t('User')} "${username}" ${t(
              'will stop being associated with owner'
            )} "${ownerName}"`}</>
          }
          onConfirm={handleDelete}
          actionBtn={
            <Button
              text='Remove'
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
