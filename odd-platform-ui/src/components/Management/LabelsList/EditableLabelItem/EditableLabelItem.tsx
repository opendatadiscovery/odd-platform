import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Label } from 'generated-sources';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch } from 'lib/redux/hooks';
import { deleteLabel } from 'redux/thunks';

import LabelEditForm from '../LabelEditForm/LabelEditForm';
import * as S from './EditableLabelItemStyles';

interface EditableLabelItemProps {
  label: Label;
}

const EditableLabelItem: React.FC<EditableLabelItemProps> = ({
  label,
}) => {
  const dispatch = useAppDispatch();
  const handleDelete = React.useCallback(
    () => dispatch(deleteLabel({ labelId: label.id })),
    [label, deleteLabel]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant="body1" noWrap title={label.name}>
          {label.name}
        </Typography>
      </Grid>
      {!label.external && (
        <S.ActionsContainer item>
          <LabelEditForm
            label={label}
            editBtn={
              <AppButton
                size="medium"
                color="primaryLight"
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Edit
              </AppButton>
            }
          />
          <ConfirmationDialog
            actionTitle="Are you sure you want to delete this label?"
            actionName="Delete Label"
            actionText={
              <>&quot;{label.name}&quot; will be deleted permanently.</>
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
      )}
    </S.Container>
  );
};

export default EditableLabelItem;
