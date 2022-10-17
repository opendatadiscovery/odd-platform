import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Owner } from 'generated-sources';
import { ConfirmationDialog, AppButton } from 'components/shared';
import { EditIcon, DeleteIcon } from 'components/shared/Icons';
import { deleteOwner } from 'redux/thunks';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import TruncateMarkup from 'react-truncate-markup';
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
  const { isAdmin } = usePermissions({});

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
      <S.ActionsContainer item lg={1.74}>
        <OwnerForm
          ownerId={ownerId}
          name={name}
          btnCreateEl={
            <AppButton
              color='primaryLight'
              size='medium'
              startIcon={<EditIcon />}
              sx={{ mr: 0.5 }}
              disabled={!isAdmin}
            >
              Edit
            </AppButton>
          }
        />
        <ConfirmationDialog
          actionTitle='Are you sure you want to delete this owner?'
          actionName='Delete Owner'
          actionText={<>&quot;{name}&quot; will be deleted permanently.</>}
          onConfirm={handleDelete}
          actionBtn={
            <AppButton
              size='medium'
              color='primaryLight'
              startIcon={<DeleteIcon />}
              sx={{ ml: 1 }}
              disabled={!isAdmin}
            >
              Delete
            </AppButton>
          }
        />
      </S.ActionsContainer>
    </S.Container>
  );
};

export default EditableOwnerItem;
