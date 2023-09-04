import React from 'react';
import { Typography } from '@mui/material';
import { deleteTag } from 'redux/thunks';
import { Permission, type Tag } from 'generated-sources';
import { Button, ConfirmationDialog } from 'components/shared/elements';
import { DeleteIcon, EditIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { useTranslation } from 'react-i18next';
import TagEditForm from '../TagEditForm/TagEditForm';
import * as S from './EditableTagItemStyles';

interface EditableTagItemProps {
  tag: Tag;
}

const EditableTagItem: React.FC<EditableTagItemProps> = ({ tag }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

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
        <Typography variant='body1'>{tag.important ? t('important') : ''}</Typography>
      </S.Col>
      {!tag.external && (
        <S.ActionsContainer container item>
          <WithPermissions permissionTo={Permission.TAG_UPDATE}>
            <TagEditForm
              tag={tag}
              editBtn={
                <Button
                  text={t('Edit')}
                  buttonType='secondary-m'
                  startIcon={<EditIcon />}
                  sx={{ mr: 1 }}
                />
              }
            />
          </WithPermissions>
          <WithPermissions permissionTo={Permission.TAG_DELETE}>
            <ConfirmationDialog
              actionTitle={t('Are you sure you want to delete this tag?')}
              actionName={t('Delete Tag')}
              actionText={
                <>
                  &quot;{tag.name}&quot; {t('will be deleted permanently')}
                </>
              }
              onConfirm={handleDelete}
              actionBtn={
                <Button
                  text={t('Delete')}
                  buttonType='secondary-m'
                  startIcon={<DeleteIcon />}
                />
              }
            />
          </WithPermissions>
        </S.ActionsContainer>
      )}
    </S.Container>
  );
};

export default EditableTagItem;
