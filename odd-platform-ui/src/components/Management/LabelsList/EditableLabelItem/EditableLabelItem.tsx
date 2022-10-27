import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Label, Permission } from 'generated-sources';
import { DeleteIcon, EditIcon } from 'components/shared/Icons';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { deleteLabel } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import LabelEditForm from '../LabelEditForm/LabelEditForm';
import * as S from './EditableLabelItemStyles';

interface EditableLabelItemProps {
  label: Label;
}

const EditableLabelItem: React.FC<EditableLabelItemProps> = ({ label }) => {
  const dispatch = useAppDispatch();

  const handleDelete = React.useCallback(
    () => dispatch(deleteLabel({ labelId: label.id })),
    [label, deleteLabel]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant='body1' noWrap title={label.name}>
          {label.name}
        </Typography>
      </Grid>
      {!label.external && (
        <S.ActionsContainer item>
          <WithPermissions permissionTo={Permission.LABEL_UPDATE}>
            <LabelEditForm
              label={label}
              editBtn={
                <AppButton
                  size='medium'
                  color='primaryLight'
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                >
                  Edit
                </AppButton>
              }
            />
          </WithPermissions>
          <WithPermissions permissionTo={Permission.LABEL_DELETE}>
            <ConfirmationDialog
              actionTitle='Are you sure you want to delete this label?'
              actionName='Delete Label'
              actionText={<>&quot;{label.name}&quot; will be deleted permanently.</>}
              onConfirm={handleDelete}
              actionBtn={
                <AppButton size='medium' color='primaryLight' startIcon={<DeleteIcon />}>
                  Delete
                </AppButton>
              }
            />
          </WithPermissions>
        </S.ActionsContainer>
      )}
    </S.Container>
  );
};

export default EditableLabelItem;
