import React from 'react';
import type { Message as MessageModel } from 'redux/interfaces';
import { Grid, Typography } from '@mui/material';
import { formatDistanceToNowStrict } from 'date-fns';
import { AppButton, AppAvatar } from 'components/shared';
import * as S from './MessageStyles';

interface MessageProps {
  message: MessageModel;
  isActive: boolean;
  messageOnClick: () => void;
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
}) => {
  const messageCreatedAt = formatDistanceToNowStrict(createdAt, { addSuffix: true });

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
            <AppButton
              to={{ pathname: url }}
              linkTarget='_blank'
              size='medium'
              color='primaryLight'
              sx={{ mr: 2 }}
            >
              Open in Slack
            </AppButton>
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
        <Typography variant='subtitle1'>{`${childrenMessagesCount} messages in thread`}</Typography>
      </Grid>
    </S.Container>
  );
};

export default Message;
