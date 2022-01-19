import React from 'react';
import { Typography, FormControlLabel, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import {
  Tag,
  TagFormData,
  TagApiUpdateTagRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import * as S from './TagEditFormStyles';

interface TagEditFormProps {
  editBtn: JSX.Element;
  tag: Tag;
  isLoading: boolean;
  updateTag: (params: TagApiUpdateTagRequest) => Promise<Tag>;
}

const TagEditForm: React.FC<TagEditFormProps> = ({
  editBtn,
  tag,
  isLoading,
  updateTag,
}) => {
  const { handleSubmit, control, reset, formState } = useForm<TagFormData>(
    {
      mode: 'onChange',
      reValidateMode: 'onChange',
    }
  );
  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    reset();
  };

  const handleUpdate = (data: TagFormData) => {
    updateTag({
      tagId: tag.id,
      tagFormData: data,
    }).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Tag already exists',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      Edit Tag
    </Typography>
  );

  const formContent = () => (
    <form id="tag-edit-form" onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name="name"
        control={control}
        defaultValue={tag.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppTextField
            {...field}
            placeholder="Tag Name"
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <Box sx={{ mt: 1, ml: 1.75 }}>
        <Controller
          name="important"
          control={control}
          defaultValue={tag.important}
          render={({ field }) => (
            <FormControlLabel
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              checked={field.value}
              control={<S.ImportantCheckbox sx={{ mr: 1 }} />}
              label="Important"
            />
          )}
        />
      </Box>
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="tag-edit-form"
      color="primary"
      fullWidth
      disabled={!formState.isValid}
    >
      Save
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(editBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default TagEditForm;
