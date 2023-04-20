import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppAvatar } from 'components/shared/elements';
import type { Message } from 'redux/interfaces';
import { useAppDateTime } from 'lib/hooks';
import * as S from './ThreadMessageStyles';

interface ThreadMessageProps {
  message: Message;
}

const ThreadMessage: React.FC<ThreadMessageProps> = ({
  message: { username, usernameAvatar, text, createdAt },
}) => {
  const { formatDistanceToNowStrict } = useAppDateTime();

  const messageCreatedAt = formatDistanceToNowStrict(createdAt, { addSuffix: true });

  return (
    <S.Container>
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
      </Grid>
      <S.TextContainer container>
        <Typography variant='body1'>{text}</Typography>
      </S.TextContainer>
    </S.Container>
  );
};

export default ThreadMessage;
