import React from 'react';
import { Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import type { TagFormData } from 'generated-sources';
import { getTagCreatingStatuses } from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createTag } from 'redux/thunks/tags.thunks';
import AddIcon from 'components/shared/icons/AddIcon';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/elements/AppButton/AppButton';
import TagCreateFormItem from './TagCreateFormItem/TagCreateFormItem';

interface TagCreateFormProps {
  btnCreateEl: JSX.Element;
}

interface TagCreateFormData {
  tags: TagFormData[];
}

const TagCreateForm: React.FC<TagCreateFormProps> = ({ btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const { isLoading: isTagCreating, isLoaded: isTagCreated } =
    useAppSelector(getTagCreatingStatuses);
  const methods = useForm<TagCreateFormData>({
    defaultValues: {
      tags: [{ name: '', important: false }],
    },
    mode: 'onChange',
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'tags',
  });

  const clearState = () => {
    methods.reset();
  };

  const handleCreate = async (data: TagCreateFormData) => {
    dispatch(createTag({ tagFormData: data.tags })).then(() => {
      clearState();
    });
  };

  const handleAppend = React.useCallback(() => {
    append({
      name: '',
      important: false,
    });
  }, [append]);

  const handleRemove = (index: number) => () => {
    remove(index);
    if (!fields.length) handleAppend();
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Create Tag
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form id='tag-create-form'>
        {fields.map((item, index) => (
          <TagCreateFormItem
            key={item.id}
            itemIndex={index}
            onItemRemove={handleRemove(index)}
            fieldsLength={fields.length}
          />
        ))}
        <AppButton
          size='medium'
          color='primaryLight'
          startIcon={<AddIcon />}
          onClick={handleAppend}
        >
          Create tag
        </AppButton>
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <AppButton
      size='large'
      type='submit'
      form='tag-create-form'
      color='primary'
      fullWidth
      disabled={!methods.formState.isValid}
      onClick={methods.handleSubmit(handleCreate)}
    >
      Create
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isTagCreated}
      isLoading={isTagCreating}
      clearState={clearState}
    />
  );
};

export default TagCreateForm;
