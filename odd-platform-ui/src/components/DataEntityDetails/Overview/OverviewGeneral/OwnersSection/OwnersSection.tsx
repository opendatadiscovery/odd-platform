import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Button,
  ConfirmationDialog,
  LabeledInfoItem,
  LabelItem,
} from 'components/shared/elements';
import { AddIcon, DeleteIcon, EditIcon } from 'components/shared/icons';
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
                <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_UPDATE}>
                  <OwnershipForm
                    dataEntityId={dataEntityId}
                    dataEntityOwnership={ownershipItem}
                    ownerEditBtn={
                      <Button
                        buttonType='tertiary-m'
                        icon={<EditIcon />}
                        sx={{ ml: 1 }}
                      />
                    }
                  />
                </WithPermissions>
                <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_DELETE}>
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
                      <Button
                        buttonType='tertiary-m'
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
        <WithPermissions permissionTo={Permission.DATA_ENTITY_OWNERSHIP_CREATE}>
          <OwnershipForm
            dataEntityId={dataEntityId}
            ownerEditBtn={
              <Button
                text='Add Owner'
                data-qa='add_owner'
                sx={{ mt: 0.25 }}
                buttonType='tertiary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </LabeledInfoItem>
    </Grid>
  );
};

export default OwnersSection;
