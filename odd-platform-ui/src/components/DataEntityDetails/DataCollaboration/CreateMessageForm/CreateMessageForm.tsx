import React from 'react';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { createMessageToSlack } from 'redux/thunks';
import {
  Button,
  AppInput,
  DialogWrapper,
  SlackChannelsAutocomplete,
} from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { type MessageRequest } from 'generated-sources';
import { useNavigate } from 'react-router-dom';
import { getMessageToSlackCreatingStatuses } from 'redux/selectors';

interface CreateMessageFormProps {
  dataEntityId: number;
  btnCreateEl: JSX.Element;
}

const CreateMessageForm: React.FC<CreateMessageFormProps> = ({
  dataEntityId,
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dataEntityCollaborationPath } = useAppPaths();

  const { isLoading: isMessageCreating, isLoaded: isMessageCreated } = useAppSelector(
    getMessageToSlackCreatingStatuses
  );

  const toCollaboration = dataEntityCollaborationPath(dataEntityId);

  type MessageFormData = Omit<MessageRequest, 'dataEntityId'>;

  const { control, handleSubmit, setValue, formState, reset } = useForm<MessageFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const handleFormSubmit = (formData: MessageFormData) => {
    dispatch(
      createMessageToSlack({ messageRequest: { dataEntityId, ...formData } })
    ).then(resolved => {
      if (resolved.meta.requestStatus === 'fulfilled') {
        clearState();
        navigate(toCollaboration);
      }
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Create new message
    </Typography>
  );

  const formContent = () => (
    <form id='message-to-slack-form' onSubmit={handleSubmit(handleFormSubmit)}>
      <Controller
        name='channelId'
        control={control}
        rules={{ required: true }}
        render={({ field }) => <SlackChannelsAutocomplete field={field} />}
      />
      <Controller
        name='text'
        control={control}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            sx={{ mt: 2 }}
            multiline
            minRows={4}
            label='Message'
            placeholder='Start typing...'
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => setValue('text', ''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button
      text='Send message'
      buttonType='main-lg'
      type='submit'
      form='message-to-slack-form'
      fullWidth
      disabled={!formState.isValid}
      isLoading={isMessageCreating}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, {
          onClick: () => {
            clearState();
            handleOpen();
          },
        })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isMessageCreated}
      isLoading={isMessageCreating}
      clearState={clearState}
    />
  );
};

export default CreateMessageForm;
