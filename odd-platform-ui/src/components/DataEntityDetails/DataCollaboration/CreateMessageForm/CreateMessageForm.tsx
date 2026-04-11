import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createMessageToSlack } from 'redux/thunks';
import {
  Button,
  DialogWrapper,
  Input,
  SlackChannelsAutocomplete,
} from 'components/shared/elements';
import { type MessageRequest } from 'generated-sources';
import { getMessageToSlackCreatingStatuses } from 'redux/selectors';
import { dataEntityDetailsPath } from 'routes';

interface CreateMessageFormProps {
  dataEntityId: number;
  btnCreateEl: JSX.Element;
}

const CreateMessageForm: React.FC<CreateMessageFormProps> = ({
  dataEntityId,
  btnCreateEl,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isLoading: isMessageCreating, isLoaded: isMessageCreated } = useAppSelector(
    getMessageToSlackCreatingStatuses
  );

  const toCollaboration = dataEntityDetailsPath(dataEntityId, 'discussions');

  type MessageFormData = Omit<MessageRequest, 'dataEntityId'>;

  const { control, handleSubmit, formState, reset } = useForm<MessageFormData>({
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
      {t('Create new message')}
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
          <Input
            {...field}
            sx={{ mt: 2 }}
            variant='main-m'
            placeholder={t('Start typing...')}
            label={t('Message')}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button
      text={t('Send message')}
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
