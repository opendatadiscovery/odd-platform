import React from 'react';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { createMessageToSlack } from 'redux/thunks';
import {
  AppButton,
  AppInput,
  DialogWrapper,
  SlackChannelsAutocomplete,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { MessageRequest } from 'generated-sources';
import { useHistory } from 'react-router-dom';
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
  const history = useHistory();
  const { dataEntityCollaborationPath } = useAppPaths();

  const { isLoading: isMessageCreating } = useAppSelector(
    getMessageToSlackCreatingStatuses
  );

  const toCollaboration = dataEntityCollaborationPath(dataEntityId);

  type MessageFormData = Omit<MessageRequest, 'dataEntityId'>;

  const { control, handleSubmit, setValue, formState, reset } = useForm<MessageFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    reset();
  }, [reset]);

  const handleFormSubmit = (formData: MessageFormData) => {
    dispatch(
      createMessageToSlack({ messageRequest: { dataEntityId, ...formData } })
    ).then(
      resolved => {
        if (resolved.meta.requestStatus === 'fulfilled') {
          setState({ ...initialState, isSuccessfulSubmit: true });
          clearState();
          history.push(toCollaboration);
        }
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Unable to create message',
        });
      }
    );
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
    <AppButton
      size='large'
      type='submit'
      form='message-to-slack-form'
      color='primary'
      fullWidth
      disabled={!formState.isValid}
      isLoading={isMessageCreating}
    >
      Send message
    </AppButton>
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
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isMessageCreating}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default CreateMessageForm;
