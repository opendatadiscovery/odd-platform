import React from 'react';
import { Typography } from '@mui/material';
import { deleteTag } from 'redux/thunks';
import { Permission, Tag } from 'generated-sources';
import { AppButton, ConfirmationDialog } from 'components/shared';
import { DeleteIcon, EditIcon } from 'components/shared/Icons';
import { usePermissions } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import TagEditForm from '../TagEditForm/TagEditForm';
import * as S from './EditableTagItemStyles';

interface EditableTagItemProps {
  tag: Tag;
}

const EditableTagItem: React.FC<EditableTagItemProps> = ({ tag }) => {
  const dispatch = useAppDispatch();
  const { hasAccessTo } = usePermissions({});

  const handleDelete = React.useCallback(
    () => dispatch(deleteTag({ tagId: tag.id })),
    [tag, deleteTag]
  );

  return (
    <S.Container container>
      <S.Col item>
        <Typography variant='body1' noWrap title={tag.name}>
          {tag.name}
        </Typography>
      </S.Col>
      <S.Col item>
        <Typography variant='body1'>{tag.important ? 'important' : ''}</Typography>
      </S.Col>
      {!tag.external && (
        <S.ActionsContainer container item>
          <TagEditForm
            tag={tag}
            editBtn={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
                disabled={!hasAccessTo(Permission.TAG_UPDATE)}
              >
                Edit
              </AppButton>
            }
          />
          <ConfirmationDialog
            actionTitle='Are you sure you want to delete this tag?'
            actionName='Delete Tag'
            actionText={<>&quot;{tag.name}&quot; will be deleted permanently.</>}
            onConfirm={handleDelete}
            actionBtn={
              <AppButton
                size='medium'
                color='primaryLight'
                startIcon={<DeleteIcon />}
                disabled={!hasAccessTo(Permission.TAG_DELETE)}
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

export default EditableTagItem;
