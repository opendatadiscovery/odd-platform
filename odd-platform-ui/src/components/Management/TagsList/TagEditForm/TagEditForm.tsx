import React from 'react';
import { Typography, FormControlLabel, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Tag, TagFormData } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { updateTag } from 'redux/thunks';
import {
  getTagUpdatingStatuses,
  getTAgDeletingStatuses,
} from 'redux/selectors';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';

import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppCheckbox from 'components/shared/AppCheckbox/AppCheckbox';

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
    getTAgDeletingStatuses
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
