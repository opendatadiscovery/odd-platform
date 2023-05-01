import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type Owner, Permission } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { deleteOwner } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import TruncateMarkup from 'react-truncate-markup';
import { WithPermissions } from 'components/shared/contexts';
import * as S from './EditableOwnerItemStyles';
import OwnerForm from '../OwnerForm/OwnerForm';

interface EditableOwnerItemProps {
  ownerId: Owner['id'];
  name: Owner['name'];
  roles?: Owner['roles'];
}

const EditableOwnerItem: React.FC<EditableOwnerItemProps> = ({
  ownerId,
  name,
  roles,
}) => {
  const dispatch = useAppDispatch();

  const handleDelete = React.useCallback(
    () => dispatch(deleteOwner({ ownerId })),
    [ownerId, deleteOwner]
  );

  return (
    <S.Container container>
      <Grid item lg={3.53}>
        <Typography variant='body1'>{name}</Typography>
      </Grid>
      <Grid item lg={6.73}>
        <TruncateMarkup lines={1} tokenize='words'>
          <div style={{ display: 'flex' }}>
            {roles?.map((role, idx) => (
              <TruncateMarkup.Atom key={role.id}>
                <Typography variant='body1'>
                  {`${idx ? ', ' : ''} ${role.name}`}
                </Typography>
              </TruncateMarkup.Atom>
            ))}
          </div>
        </TruncateMarkup>
      </Grid>
      <S.ActionsContainer container item lg={1.74}>
        <WithPermissions permissionTo={Permission.OWNER_UPDATE}>
          <OwnerForm
            ownerId={ownerId}
            name={name}
            roles={roles}
            btnCreateEl={
              <Button text='Edit' buttonType='secondary-m' startIcon={<EditIcon />} />
            }
          />
        </WithPermissions>
        <WithPermissions permissionTo={Permission.OWNER_DELETE}>
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this owner?'
            actionName='Delete Owner'
            actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
            onConfirm={handleDelete}
            actionBtn={
              <Button
                text='Delete'
                buttonType='secondary-m'
                startIcon={<DeleteIcon />}
                sx={{ ml: 1 }}
              />
            }
          />
        </WithPermissions>
      </S.ActionsContainer>
    </S.Container>
  );
};

export default EditableOwnerItem;
