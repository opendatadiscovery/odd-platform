import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type Namespace, Permission } from 'generated-sources';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { Button, ConfirmationDialog } from 'components/shared/elements';
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
              <Button
                text='Edit'
                buttonType='secondary-m'
                startIcon={<EditIcon />}
                sx={{ mr: 0.5 }}
              />
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
              <Button text='Delete' buttonType='secondary-m' startIcon={<DeleteIcon />} />
            }
          />
        </WithPermissions>
      </S.ActionsContainer>
    </S.Container>
  );
};

export default EditableNamespaceItem;
