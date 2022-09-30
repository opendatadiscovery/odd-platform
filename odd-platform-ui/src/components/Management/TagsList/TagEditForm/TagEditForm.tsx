import React from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Tag, TagFormData } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateTag } from 'redux/thunks';
import {
  getTagDeletingStatuses,
  getTagUpdatingStatuses,
} from 'redux/selectors';
import {
  AppButton,
  AppCheckbox,
  AppInput,
  DialogWrapper,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';

interface TagEditFormProps {
  editBtn: JSX.Element;
  tag: Tag;
}

const TagEditForm: React.FC<TagEditFormProps> = ({ editBtn, tag }) => {
  const dispatch = useAppDispatch();

  const { isLoading: isTagUpdating } = useAppSelector(
    getTagUpdatingStatuses
  );

  const { isLoading: isTagDeleting } = useAppSelector(
    getTagDeletingStatuses
  );

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
    dispatch(
      updateTag({
        tagId: tag.id,
        tagFormData: data,
      })
    ).then(
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
          <AppInput
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
      <Box sx={{ mt: 1 }}>
        <Controller
          name="important"
          control={control}
          defaultValue={tag.important}
          render={({ field }) => (
            <FormControlLabel
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              sx={{ ml: -0.25 }}
              checked={field.value}
              control={<AppCheckbox sx={{ mr: 1 }} />}
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
      isLoading={isTagUpdating || isTagDeleting}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default TagEditForm;
