import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Namespace,
  NamespaceApiDeleteNamespaceRequest,
} from 'generated-sources';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import NamespaceFormContainer from '../NamespaceForm/NamespaceFormContainer';
import * as S from './EditableNamespaceItemStyles';

interface EditableNamespaceItemProps {
  namespace: Namespace;
  deleteNamespace: (
    params: NamespaceApiDeleteNamespaceRequest
  ) => Promise<void>;
}

const EditableNamespaceItem: React.FC<EditableNamespaceItemProps> = ({
  namespace,
  deleteNamespace,
}) => {
  const handleDelete = React.useCallback(
    () => deleteNamespace({ namespaceId: namespace.id }),
    [namespace, deleteNamespace]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant="body1" noWrap title={namespace.name}>
          {namespace.name}
        </Typography>
      </Grid>
      <S.ActionsContainer item>
        <NamespaceFormContainer
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
