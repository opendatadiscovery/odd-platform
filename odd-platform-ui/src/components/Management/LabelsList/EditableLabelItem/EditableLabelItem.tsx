import React from 'react';
import { Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Label, LabelApiDeleteLabelRequest } from 'generated-sources';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import AppButton from 'components/shared/AppButton/AppButton';
import LabelEditFormContainer from '../LabelEditForm/LabelEditFormContainer';
import { styles, StylesType } from './EditableLabelItemStyles';

interface EditableLabelItemProps extends StylesType {
  label: Label;
  deleteLabel: (params: LabelApiDeleteLabelRequest) => Promise<void>;
}

const EditableLabelItem: React.FC<EditableLabelItemProps> = ({
  classes,
  label,
  deleteLabel,
}) => {
  const handleDelete = React.useCallback(
    () => deleteLabel({ labelId: label.id }),
    [label, deleteLabel]
  );

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Typography variant="body1" noWrap title={label.name}>
          {label.name}
        </Typography>
      </Grid>
      <Grid item className={classes.actionsContainer}>
        <LabelEditFormContainer
          label={label}
          editBtn={
            <AppButton
              size="medium"
              color="primaryLight"
              startIcon={<EditIcon />}
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
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(EditableLabelItem);
