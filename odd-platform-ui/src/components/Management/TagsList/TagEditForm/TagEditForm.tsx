import React from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Tag, TagFormData } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateTag } from 'redux/thunks';
import { getTagCreatingStatuses, getTagUpdatingStatuses } from 'redux/selectors';
import { Button, Checkbox, DialogWrapper, Input } from 'components/shared/elements';

interface TagEditFormProps {
  editBtn: JSX.Element;
  tag: Tag;
}

const TagEditForm: React.FC<TagEditFormProps> = ({ editBtn, tag }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { isLoading: isTagUpdating, isLoaded: isTagUpdated } =
    useAppSelector(getTagUpdatingStatuses);
  const { isLoading: isTagCreating, isLoaded: isTagCreated } =
    useAppSelector(getTagCreatingStatuses);

  const { handleSubmit, control, reset, formState } = useForm<TagFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const handleUpdate = (tagFormData: TagFormData) => {
    dispatch(updateTag({ tagId: tag.id, tagFormData })).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {t('Edit Tag')}
    </Typography>
  );

  const formContent = () => (
    <form id='tag-edit-form' onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name='name'
        control={control}
        defaultValue={tag.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input {...field} sx={{ mt: 2 }} variant='main-m' placeholder={t('Tag Name')} />
        )}
      />
      <Box sx={{ mt: 1 }}>
        <Controller
          name='important'
          control={control}
          defaultValue={tag.important}
          render={({ field }) => (
            <FormControlLabel
              {...field}
              sx={{ ml: -0.25 }}
              checked={field.value}
              control={<Checkbox sx={{ mr: 1 }} />}
              label={t('Important')}
            />
          )}
        />
      </Box>
    </form>
  );

  const formActionButtons = () => (
    <Button
      text={t('Save')}
      type='submit'
      form='tag-edit-form'
      buttonType='main-lg'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(editBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isTagUpdated || isTagCreated}
      isLoading={isTagUpdating || isTagCreating}
      clearState={clearState}
    />
  );
};

export default TagEditForm;
