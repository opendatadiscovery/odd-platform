import React from 'react';
import type { Message as MessageModel } from 'redux/interfaces';
import { Grid, Typography } from '@mui/material';
import { AppAvatar, Button, WithFeature } from 'components/shared/elements';
import { Feature } from 'generated-sources';
import { useAppDateTime } from 'lib/hooks';
import * as S from './MessageStyles';

interface MessageProps {
  message: MessageModel;
  isActive: boolean;
  messageOnClick: () => void;
  handleSetMessageDate: (date: string) => void;
}
const Message: React.FC<MessageProps> = ({
  message: {
    text,
    username,
    usernameAvatar,
    createdAt,
    url,
    channel,
    childrenMessagesCount,
  },
  isActive,
  messageOnClick,
  handleSetMessageDate,
}) => {
  const { formatDistanceToNowStrict, datedListFormattedDateTime } = useAppDateTime();

  const messageCreatedAt = formatDistanceToNowStrict(createdAt, { addSuffix: true });
  const messagesCount = childrenMessagesCount ?? 0;

  React.useEffect(() => {
    if (isActive) {
      const formattedDate = datedListFormattedDateTime(createdAt);
      handleSetMessageDate(formattedDate);
    }
  }, [isActive, createdAt, handleSetMessageDate]);

  return (
    <S.Container $active={isActive} container onClick={messageOnClick}>
      <Grid container justifyContent='space-between' flexWrap='nowrap'>
        <Grid container flexWrap='nowrap' alignItems='center'>
          <AppAvatar alt='avatar' src={usernameAvatar} variant='rounded' />
          <Typography variant='h4' mx={1}>
            {username}
          </Typography>
          <Typography variant='body1' color='texts.hint'>
            {messageCreatedAt}
          </Typography>
        </Grid>
        <Grid container alignItems='center' justifyContent='flex-end' flexWrap='nowrap'>
          <S.SlackButtonContainer $active={isActive}>
            <WithFeature featureName={Feature.DATA_COLLABORATION}>
              <Button
                text='Open in Slack'
                to={url}
                target='_blank'
                buttonType='secondary-m'
                sx={{ mr: 2 }}
              />
            </WithFeature>
          </S.SlackButtonContainer>
          <Typography variant='body1' color='texts.hint'>
            {channel.name}
          </Typography>
        </Grid>
      </Grid>
      <Grid container justifyContent='flex-start'>
        <Typography variant='body1' my={0.5}>
          {text}
        </Typography>
      </Grid>
      <Grid container justifyContent='flex-start'>
        <Typography variant='subtitle1'>{`${messagesCount} messages in thread`}</Typography>
      </Grid>
    </S.Container>
  );
};

export default Message;
