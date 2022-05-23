import React from 'react';
import { Typography } from '@mui/material';
import { Tag, TagApiDeleteTagRequest } from 'generated-sources';
import ConfirmationDialog from 'components/shared/ConfirmationDialog/ConfirmationDialog';
import EditIcon from 'components/shared/Icons/EditIcon';
import DeleteIcon from 'components/shared/Icons/DeleteIcon';
import TagEditFormContainer from 'components/Management/TagsList/TagEditForm/TagEditFormContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import * as S from './EditableTagItemStyles';

interface EditableTagItemProps {
  tag: Tag;
  deleteTag: (params: TagApiDeleteTagRequest) => Promise<void>;
}

const EditableTagItem: React.FC<EditableTagItemProps> = ({
  tag,
  deleteTag,
}) => {
  const handleDelete = React.useCallback(
    () => deleteTag({ tagId: tag.id }),
    [tag, deleteTag]
  );

  return (
    <S.Container container>
      <S.Col item>
        <Typography variant="body1" noWrap title={tag.name}>
          {tag.name}
        </Typography>
      </S.Col>
      <S.Col item>
        <Typography variant="body1">
          {tag.important ? 'important' : ''}
        </Typography>
      </S.Col>
      <S.ActionsContainer container item>
        <TagEditFormContainer
          tag={tag}
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

export default EditableTagItem;
