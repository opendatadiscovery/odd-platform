import React from 'react';
import { Typography } from '@mui/material';
import compact from 'lodash/compact';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Button, DialogWrapper, TagItem } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataSetFieldTags } from 'redux/thunks';
import { getDataEntityTags, getDataEntityTagsUpdatingStatuses } from 'redux/selectors';
import type { Tag } from 'generated-sources';
import { TagListContainer } from './TagsEditFormStyles';
import TagsEditFormAutocomplete from './TagsEditFormAutocomplete/TagsEditFormAutocomplete';

interface TagsEditProps {
  btnEditEl: React.JSX.Element;
  datasetFieldId: number;
}

type DatasetFieldTagsFormType = {
  tagNames: Pick<Tag, 'name' | 'important' | 'external'>[];
};

const TagsEditForm: React.FC<TagsEditProps> = ({ btnEditEl, datasetFieldId }) => {
  const dispatch = useAppDispatch();
  const datasetFieldTags = useAppSelector(getDataEntityTags(datasetFieldId));
  const { isLoading: isTagsUpdating, isLoaded: isTagsUpdated } = useAppSelector(
    getDataEntityTagsUpdatingStatuses
  );

  const methods = useForm<DatasetFieldTagsFormType>({
    defaultValues: { tagNames: [{ name: '' }] },
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'tagNames',
  });

  const onOpen = (handleOpen: () => void) => () => {
    methods.reset({
      tagNames: datasetFieldTags?.map(tag => ({
        name: tag.name,
        important: tag.important,
        external: tag.external,
      })),
    });
    handleOpen();
  };

  const clearFormState = () => {
    methods.reset();
  };

  const handleSubmit = (data: DatasetFieldTagsFormType) => {
    dispatch(
      updateDataSetFieldTags({
        datasetFieldId,
        datasetFieldTagsUpdateFormData: {
          tags: compact([...data.tagNames.map(tag => tag.name)]),
        },
      })
    ).then(() => {
      clearFormState();
    });
  };

  const handleRemove = React.useCallback(
    (index: number) => () => {
      remove(index);
    },
    [remove]
  );

  const formTitle = (
    <Typography variant='h4' component='span'>
      Edit Tags
    </Typography>
  );

  const formContent = () => (
    <>
      <TagsEditFormAutocomplete append={append} />
      <FormProvider {...methods}>
        <form id='tags-create-form' onSubmit={methods.handleSubmit(handleSubmit)}>
          <TagListContainer sx={{ mt: 1 }}>
            {fields?.map((field, index) => (
              <TagItem
                sx={{ my: 0.5, mr: 0.5 }}
                key={field.id}
                systemTag={field.external}
                label={field.name}
                important={field.important}
                removable
                onRemoveClick={handleRemove(index)}
              />
            ))}
          </TagListContainer>
        </form>
      </FormProvider>
    </>
  );

  const formActionButtons = () => (
    <Button
      text='Save'
      buttonType='main-lg'
      type='submit'
      form='tags-create-form'
      fullWidth
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnEditEl, { onClick: onOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isTagsUpdated}
      isLoading={isTagsUpdating}
      formSubmitHandler={methods.handleSubmit(handleSubmit)}
    />
  );
};

export default TagsEditForm;
