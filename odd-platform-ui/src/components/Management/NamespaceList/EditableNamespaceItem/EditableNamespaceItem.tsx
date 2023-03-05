import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type Namespace, Permission } from 'generated-sources';
import { DeleteIcon, EditIcon } from 'components/shared/Icons';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { deleteNamespace } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import NamespaceForm from '../NamespaceForm/NamespaceForm';
import * as S from './EditableNamespaceItemStyles';

interface EditableNamespaceItemProps {
  namespace: Namespace;
}

const EditableNamespaceItem: React.FC<EditableNamespaceItemProps> = ({ namespace }) => {
  const dispatch = useAppDispatch();

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
        <WithPermissions permissionTo={Permission.NAMESPACE_UPDATE}>
          <NamespaceForm
            namespace={namespace}
            btnEl={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<EditIcon />}
                sx={{ mr: 0.5 }}
              >
                Edit
              </AppButton>
            }
          />
        </WithPermissions>
        <WithPermissions permissionTo={Permission.NAMESPACE_DELETE}>
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this namespace?'
            actionName='Delete Namespace'
            actionText={<>&quot;{namespace.name}&quot; will be deleted permanently.</>}
            onConfirm={handleDelete}
            actionBtn={
              <AppButton size='medium' color='primaryLight' startIcon={<DeleteIcon />}>
                Delete
              </AppButton>
            }
          />
        </WithPermissions>
      </S.ActionsContainer>
    </S.Container>
  );
};

export default EditableNamespaceItem;
