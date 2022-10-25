import React from 'react';
import { Grid } from '@mui/material';
import {
  AppButton,
  AppIconButton,
  ConfirmationDialog,
  LabeledInfoItem,
  LabelItem,
} from 'components/shared';
import { AddIcon, DeleteIcon, EditIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { deleteDataEntityOwnership } from 'redux/thunks';
import { getDataEntityOwnership } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { PermissionProvider, WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import * as S from './OwnersSectionStyles';
import OwnershipForm from './OwnershipForm/OwnershipForm';

const OwnersSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const ownership = useAppSelector(getDataEntityOwnership(dataEntityId));

  const handleOwnershipDelete = (ownershipId: number) => () =>
    dispatch(deleteDataEntityOwnership({ dataEntityId, ownershipId }));

  return (
    <Grid item sm={12} sx={{ mt: 2 }}>
      <LabeledInfoItem label='Owners'>
        {ownership?.map(ownershipItem => (
          <S.OwnerItem key={ownershipItem.id}>
            {ownershipItem.owner.name}
            <LabelItem labelName={ownershipItem.title?.name} />
            <S.OwnerActionBtns>
              <PermissionProvider permissions={[Permission.DATA_ENTITY_OWNERSHIP_UPDATE]}>
                <WithPermissions
                  resourceId={dataEntityId}
                  renderContent={({ isAllowedTo: updateOwner }) => (
                    <OwnershipForm
                      dataEntityId={dataEntityId}
                      dataEntityOwnership={ownershipItem}
                      ownerEditBtn={
                        <AppIconButton
                          size='small'
                          color='tertiary'
                          icon={<EditIcon />}
                          sx={{ ml: 1 }}
                          disabled={!updateOwner}
                        />
                      }
                    />
                  )}
                />
              </PermissionProvider>
              <PermissionProvider permissions={[Permission.DATA_ENTITY_OWNERSHIP_DELETE]}>
                <WithPermissions
                  resourceId={dataEntityId}
                  renderContent={({ isAllowedTo: deleteOwner }) => (
                    <ConfirmationDialog
                      actionTitle='Are you sure you want to delete this owner?'
                      actionName='Delete Owner'
                      actionText={
                        <>
                          &quot;{ownershipItem.owner.name}&quot; will be deleted
                          permanently.
                        </>
                      }
                      onConfirm={handleOwnershipDelete(ownershipItem.id)}
                      actionBtn={
                        <AppIconButton
                          size='small'
                          color='tertiary'
                          icon={<DeleteIcon />}
                          sx={{ ml: 0.5 }}
                          disabled={!deleteOwner}
                        />
                      }
                    />
                  )}
                />
              </PermissionProvider>
            </S.OwnerActionBtns>
          </S.OwnerItem>
        ))}
        <PermissionProvider permissions={[Permission.DATA_ENTITY_OWNERSHIP_CREATE]}>
          <WithPermissions
            resourceId={dataEntityId}
            renderContent={({ isAllowedTo: addOwner }) => (
              <OwnershipForm
                dataEntityId={dataEntityId}
                ownerEditBtn={
                  <AppButton
                    sx={{ mt: 0.25 }}
                    size='medium'
                    color='tertiary'
                    startIcon={<AddIcon />}
                    disabled={!addOwner}
                  >
                    Add Owner
                  </AppButton>
                }
              />
            )}
          />
        </PermissionProvider>
      </LabeledInfoItem>
    </Grid>
  );
};

export default OwnersSection;
