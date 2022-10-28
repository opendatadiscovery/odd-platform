import React from 'react';
import { Grid, Typography } from '@mui/material';
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
import { WithPermissions } from 'components/shared/contexts';
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
        {ownership?.length ? (
          ownership?.map(ownershipItem => (
            <S.OwnerItem key={ownershipItem.id}>
              {ownershipItem.owner.name}
              <LabelItem labelName={ownershipItem.title?.name} />
              <S.OwnerActionBtns>
                <WithPermissions
                  resourceId={dataEntityId}
                  permissionTo={Permission.DATA_ENTITY_OWNERSHIP_UPDATE}
                >
                  <OwnershipForm
                    dataEntityId={dataEntityId}
                    dataEntityOwnership={ownershipItem}
                    ownerEditBtn={
                      <AppIconButton
                        size='small'
                        color='tertiary'
                        icon={<EditIcon />}
                        sx={{ ml: 1 }}
                      />
                    }
                  />
                </WithPermissions>
                <WithPermissions
                  resourceId={dataEntityId}
                  permissionTo={Permission.DATA_ENTITY_OWNERSHIP_DELETE}
                >
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
                      />
                    }
                  />
                </WithPermissions>
              </S.OwnerActionBtns>
            </S.OwnerItem>
          ))
        ) : (
          <Typography variant='subtitle2'>Not created.</Typography>
        )}
        <WithPermissions
          resourceId={dataEntityId}
          permissionTo={Permission.DATA_ENTITY_OWNERSHIP_CREATE}
        >
          <OwnershipForm
            dataEntityId={dataEntityId}
            ownerEditBtn={
              <AppButton
                sx={{ mt: 0.25 }}
                size='medium'
                color='tertiary'
                startIcon={<AddIcon />}
              >
                Add Owner
              </AppButton>
            }
          />
        </WithPermissions>
      </LabeledInfoItem>
    </Grid>
  );
};

export default OwnersSection;
