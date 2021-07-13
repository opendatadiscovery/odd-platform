import React from 'react';
import {
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import {
  Tag,
  TagFormData,
  TagApiUpdateTagRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import { StylesType } from './TagEditFormStyles';

interface TagEditFormProps extends StylesType {
  editBtn: JSX.Element;
  tag: Tag;
  isLoading: boolean;
  updateTag: (params: TagApiUpdateTagRequest) => Promise<Tag>;
}

const TagEditForm: React.FC<TagEditFormProps> = ({
  classes,
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

  const formTitle = <Typography variant="h4">Edit Tag</Typography>;

  const formContent = () => (
    <form id="tag-edit-form" onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name="name"
        control={control}
        defaultValue={tag.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Tag Name"
            variant="outlined"
            InputProps={{
              endAdornment: field.value && (
                <InputAdornment position="start">
                  <AppButton
                    size="small"
                    color="unfilled"
                    icon={<CancelIcon />}
                    onClick={() => field.onChange('')}
                  />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      <div className={classes.tagItemButtons}>
        <Controller
          name="important"
          control={control}
          defaultValue={tag.important}
          render={({ field }) => (
            <FormControlLabel
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              className={classes.checkboxContainer}
              checked={field.value}
              control={<Checkbox className={classes.pullingCheckbox} />}
              label="Important"
            />
          )}
        />
      </div>
    </form>
  );

  const formActionButtons = (handleClose: () => void) => (
    <AppButton
      size="large"
      type="submit"
      form="tag-edit-form"
      color="primary"
      fullWidth
      onClick={() => {}}
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
      renderActions={({ handleClose }) => formActionButtons(handleClose)}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
    />
  );
};

export default TagEditForm;
