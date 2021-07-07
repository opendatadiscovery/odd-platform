import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import { Tag, TagApiDeleteTagRequest } from 'generated-sources';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import EditIcon from 'components/shared/Icons/EditIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import {
  styles,
  StylesType,
} from 'components/Management/TagsList/EditableTagItem/EditableTagItemStyles';
import cx from 'classnames';
import TagEditFormContainer from 'components/Management/TagsList/TagEditForm/TagEditFormContainer';

interface EditableTagItemProps extends StylesType {
  tag: Tag;
  deleteTag: (params: TagApiDeleteTagRequest) => Promise<void>;
}

const EditableTagItem: React.FC<EditableTagItemProps> = ({
  classes,
  tag,
  deleteTag,
}) => {
  const handleDelete = React.useCallback(
    () => deleteTag({ tagId: tag.id }),
    [tag, deleteTag]
  );

  return (
    <Grid container className={classes.container}>
      <Grid item className={classes.col}>
        <Typography variant="body1" noWrap title={tag.name}>
          {tag.name}
        </Typography>
      </Grid>
      <Grid item className={classes.col}>
        <Typography variant="body1">
          {tag.important ? 'important' : ''}
        </Typography>
      </Grid>
      <Grid item className={cx(classes.col, classes.actionsContainer)}>
        <TagEditFormContainer
          tag={tag}
          editBtn={
            <AppButton
              size="medium"
              color="primaryLight"
              icon={<EditIcon />}
              onClick={() => {}}
            >
              Edit
            </AppButton>
          }
        />
        <ConfirmationDialog
          actionTitle="Are you sure you want to delete this tag?"
          actionName="Delete Tag"
          actionText={
            <>&quot;{tag.name}&quot; will be deleted permanently.</>
          }
          onConfirm={handleDelete}
          actionBtn={
            <AppButton
              size="medium"
              color="primaryLight"
              icon={<DeleteIcon />}
              onClick={() => {}}
            >
              Delete
            </AppButton>
          }
        />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(EditableTagItem);
