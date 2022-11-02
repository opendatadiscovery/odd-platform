import React from 'react';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch } from 'redux/lib/hooks';
import { Box, Grid, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { createMessageToSlack } from 'redux/thunks';
import {
  AppButton,
  AppIconButton,
  AppInput,
  SlackChannelsAutocomplete,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { MessageRequest } from 'generated-sources';
import { useHistory } from 'react-router-dom';

interface MessageFormProps {
  dataEntityId: number;
}

const MessageForm: React.FC<MessageFormProps> = ({ dataEntityId }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityCollaborationPath } = useAppPaths();

  const toCollaboration = dataEntityCollaborationPath(dataEntityId);

  type MessageFormData = Omit<MessageRequest, 'dataEntityId'>;

  const { control, handleSubmit, setValue, formState } = useForm<MessageFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const handleFormSubmit = (formData: MessageFormData) => {
    dispatch(
      createMessageToSlack({ messageRequest: { dataEntityId, ...formData } })
    ).then(response => {
      if (response.meta.requestStatus === 'fulfilled') {
        history.push(toCollaboration);
      }
    });
  };

  return (
    <Grid container flexDirection='column' flexWrap='nowrap' pl={2} pt={2}>
      <Grid container justifyContent='space-between' alignItems='center'>
        <Typography variant='h1' component='span'>
          New message
        </Typography>
        <AppIconButton
          sx={{ ml: 2 }}
          size='medium'
          color='unfilled'
          icon={<ClearIcon viewBox='0 0 16 16' width={24} height={24} />}
          onClick={() => history.goBack()}
        />
      </Grid>
      <Box mt={3}>
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
      </Box>
      <AppButton
        size='large'
        type='submit'
        form='message-to-slack-form'
        color='primary'
        fullWidth
        sx={{ mt: 5, width: 'fit-content' }}
        disabled={!formState.isValid}
      >
        Send message
      </AppButton>
    </Grid>
  );
};

export default MessageForm;
