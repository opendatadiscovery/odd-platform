import React from 'react';
import { Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Owner, OwnerApiDeleteOwnerRequest } from 'generated-sources';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import OwnerFormContainer from 'components/Management/OwnersList/OwnerForm/OwnerFormContainer';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
import { styles, StylesType } from './EditableOwnerItemStyles';

interface EditableOwnerItemProps extends StylesType {
  owner: Owner;
  deleteOwner: (params: OwnerApiDeleteOwnerRequest) => Promise<void>;
}

const EditableOwnerItem: React.FC<EditableOwnerItemProps> = ({
  classes,
  owner,
  deleteOwner,
}) => {
  const handleDelete = React.useCallback(
    () => deleteOwner({ ownerId: owner.id }),
    [owner, deleteOwner]
  );

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Typography variant="body1" noWrap title={owner.name}>
          {owner.name}
        </Typography>
      </Grid>
      <Grid item className={classes.actionsContainer}>
        <OwnerFormContainer
          owner={owner}
          btnCreateEl={
            <AppButton2
              color="primaryLight"
              size="medium"
              startIcon={<EditIcon />}
            >
              Edit
            </AppButton2>
          }
        />
        <ConfirmationDialog
          actionTitle="Are you sure you want to delete this owner?"
          actionName="Delete Owner"
          actionText={
            <>&quot;{owner.name}&quot; will be deleted permanently.</>
          }
          onConfirm={handleDelete}
          actionBtn={
            <AppButton2
              size="medium"
              color="primaryLight"
              startIcon={<DeleteIcon />}
              sx={{ ml: 1 }}
            >
              Delete
            </AppButton2>
          }
        />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(EditableOwnerItem);
