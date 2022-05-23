import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  Tag,
  TagApiGetPopularTagListRequest,
  TagsResponse,
} from 'generated-sources';
import compact from 'lodash/compact';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import TagItem from 'components/shared/TagItem/TagItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch } from 'lib/redux/hooks';
import { updateDataEntityTags } from 'redux/thunks';
import TagsEditFormAutocomplete from './TagsEditFormAutocomplete/TagsEditFormAutocomplete';

interface TagsEditProps {
  dataEntityId: number;
  dataEntityTags?: Tag[];
  isLoading: boolean;
  searchTags: (
    params: TagApiGetPopularTagListRequest
  ) => Promise<TagsResponse>;
  btnEditEl: JSX.Element;
}

const TagsEditForm: React.FC<TagsEditProps> = ({
  dataEntityId,
  dataEntityTags,
  isLoading,
  searchTags,
  btnEditEl,
}) => {
  const dispatch = useAppDispatch();

  type DataEntityTagsFormType = {
    tagNameList: { name: string; important: boolean }[];
  };
  const methods = useForm<DataEntityTagsFormType>({
    defaultValues: { tagNameList: [{ name: '', important: false }] },
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'tagNameList',
  });

  const onOpen = (handleOpen: () => void) => () => {
    methods.reset({
      tagNameList: dataEntityTags?.map(tag => ({
        name: tag.name,
        important: tag.important,
      })),
    });
    handleOpen();
  };
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const clearFormState = () => {
    setFormState(initialFormState);
    methods.reset();
  };

  const handleSubmit = (data: DataEntityTagsFormType) => {
    dispatch(
      updateDataEntityTags({
        dataEntityId,
        tagsFormData: {
          tagNameList: compact([...data.tagNameList.map(tag => tag.name)]),
        },
      })
    ).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        clearFormState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update tags',
        });
      }
    );
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      Edit Tags
    </Typography>
  );

  const formContent = () => (
    <>
      <TagsEditFormAutocomplete searchTags={searchTags} append={append} />
      <FormProvider {...methods}>
        <form
          id="tags-create-form"
          onSubmit={methods.handleSubmit(handleSubmit)}
        >
          <Box sx={{ mt: 1 }}>
            {fields?.map((field, index) => (
              <TagItem
                sx={{ my: 0.5, mr: 0.5 }}
                key={field.id}
                label={field.name}
                important={field.important}
                removable
                onRemoveClick={handleRemove(index)}
              />
            ))}
          </Box>
        </form>
      </FormProvider>
    </>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="tags-create-form"
      color="primary"
      fullWidth
    >
      Save
    </AppButton>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnEditEl, { onClick: onOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
    />
  );
};

export default TagsEditForm;
