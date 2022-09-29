import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Owner } from 'generated-sources';
import { ConfirmationDialog, AppButton } from 'components/shared';
import { EditIcon, DeleteIcon } from 'components/shared/Icons';
import { deleteOwner } from 'redux/thunks';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import * as S from './EditableOwnerItemStyles';
import OwnerForm from '../OwnerForm/OwnerForm';

interface EditableOwnerItemProps {
  owner: Owner;
}

const EditableOwnerItem: React.FC<EditableOwnerItemProps> = ({ owner }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const handleDelete = React.useCallback(
    () => dispatch(deleteOwner({ ownerId: owner.id })),
    [owner, deleteOwner]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant='body1' noWrap title={owner.name}>
          {owner.name}
        </Typography>
      </Grid>
      <S.ActionsContainer item>
        <OwnerForm
          owner={owner}
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
          actionText={<>&quot;{owner.name}&quot; will be deleted permanently.</>}
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
