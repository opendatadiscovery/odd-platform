import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Label, LabelApiDeleteLabelRequest } from 'generated-sources';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import LabelEditForm from '../LabelEditForm/LabelEditForm';
import * as S from './EditableLabelItemStyles';

interface EditableLabelItemProps {
  label: Label;
  deleteLabel: (params: LabelApiDeleteLabelRequest) => Promise<unknown>;
}

const EditableLabelItem: React.FC<EditableLabelItemProps> = ({
  label,
  deleteLabel,
}) => {
  const handleDelete = React.useCallback(
    () => deleteLabel({ labelId: label.id }),
    [label, deleteLabel]
  );

  return (
    <S.Container container>
      <Grid item>
        <Typography variant="body1" noWrap title={label.name}>
          {label.name}
        </Typography>
      </Grid>
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
    </S.Container>
  );
};

export default EditableLabelItem;
