import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Namespace } from 'generated-sources';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import { deleteNamespace } from 'redux/thunks';
import { useAppDispatch } from 'lib/redux/hooks';
import NamespaceForm from '../NamespaceForm/NamespaceForm';
import * as S from './EditableNamespaceItemStyles';

interface EditableNamespaceItemProps {
  namespace: Namespace;
}

const EditableNamespaceItem: React.FC<EditableNamespaceItemProps> = ({
  namespace,
}) => {
  const dispatch = useAppDispatch();

  const handleDelete = React.useCallback(
    () => dispatch(deleteNamespace({ namespaceId: namespace.id })),
    [namespace.id, deleteNamespace]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant="body1" noWrap title={namespace.name}>
          {namespace.name}
        </Typography>
      </Grid>
      <S.ActionsContainer item>
        <NamespaceForm
          namespace={namespace}
          btnEl={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<EditIcon />}
              sx={{ mr: 0.5 }}
            >
              Edit
            </AppButton>
          }
        />
        <ConfirmationDialog
          actionTitle="Are you sure you want to delete this namespace?"
          actionName="Delete Namespace"
          actionText={
            <>&quot;{namespace.name}&quot; will be deleted permanently.</>
          }
          onConfirm={handleDelete}
          actionBtn={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<DeleteIcon />}
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
