import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Namespace } from 'generated-sources';
import { EditIcon, DeleteIcon } from 'components/shared/Icons';
import { ConfirmationDialog, AppButton } from 'components/shared';
import { deleteNamespace } from 'redux/thunks';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import NamespaceForm from '../NamespaceForm/NamespaceForm';
import * as S from './EditableNamespaceItemStyles';

interface EditableNamespaceItemProps {
  namespace: Namespace;
}

const EditableNamespaceItem: React.FC<EditableNamespaceItemProps> = ({ namespace }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

  const handleDelete = React.useCallback(
    () => dispatch(deleteNamespace({ namespaceId: namespace.id })),
    [namespace.id, deleteNamespace]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant='body1' noWrap title={namespace.name}>
          {namespace.name}
        </Typography>
      </Grid>
      <S.ActionsContainer item>
        <NamespaceForm
          namespace={namespace}
          btnEl={
            <AppButton
              size='medium'
              color='primaryLight'
              startIcon={<EditIcon />}
              sx={{ mr: 0.5 }}
              disabled={!isAdmin}
            >
              Edit
            </AppButton>
          }
        />
        <ConfirmationDialog
          actionTitle='Are you sure you want to delete this namespace?'
          actionName='Delete Namespace'
          actionText={<>&quot;{namespace.name}&quot; will be deleted permanently.</>}
          onConfirm={handleDelete}
          actionBtn={
            <AppButton
              size='medium'
              color='primaryLight'
              startIcon={<DeleteIcon />}
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

export default EditableNamespaceItem;
