import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Label } from 'generated-sources';
import { EditIcon, DeleteIcon } from 'components/shared/Icons';
import { ConfirmationDialog, AppButton } from 'components/shared';
import { deleteLabel } from 'redux/thunks';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import LabelEditForm from '../LabelEditForm/LabelEditForm';
import * as S from './EditableLabelItemStyles';

interface EditableLabelItemProps {
  label: Label;
}

const EditableLabelItem: React.FC<EditableLabelItemProps> = ({ label }) => {
  const dispatch = useAppDispatch();
  const { isAdmin } = usePermissions({});

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
          <LabelEditForm
            label={label}
            editBtn={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
                disabled={!isAdmin}
              >
                Edit
              </AppButton>
            }
          />
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this label?'
            actionName='Delete Label'
            actionText={<>&quot;{label.name}&quot; will be deleted permanently.</>}
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
      )}
    </S.Container>
  );
};

export default EditableLabelItem;
