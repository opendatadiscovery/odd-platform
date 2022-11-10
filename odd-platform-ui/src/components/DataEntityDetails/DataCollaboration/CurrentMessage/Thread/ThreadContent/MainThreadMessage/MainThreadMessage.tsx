import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppButton, AppAvatar } from 'components/shared';
import { Message } from 'redux/interfaces';
import * as S from './MainThreadMessageStyles';

interface MainThreadMessageProps {
  mainMessage: Message;
}

const MainThreadMessage: React.FC<MainThreadMessageProps> = ({
  mainMessage: { usernameAvatar, username, url, text, channel },
}) => {
  const maxTextLength = 220;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isExpandable = text?.length > maxTextLength;
  const truncatedText =
    text?.length > maxTextLength ? `${text?.substring(0, maxTextLength)}...` : text;

  return (
    <S.MainMessageContainer>
      <Grid container justifyContent='space-between' flexWrap='nowrap'>
        <Grid container flexWrap='nowrap' alignItems='center'>
          <AppAvatar alt='avatar' src={usernameAvatar} variant='rounded' />
          <Typography variant='h4' mx={1}>
            {username}
          </Typography>
          <Typography variant='body1' color='texts.hint'>
            {channel?.name}
          </Typography>
        </Grid>
        <Grid container alignItems='center' justifyContent='flex-end' flexWrap='nowrap'>
          <AppButton
            to={{ pathname: url }}
            linkTarget='_blank'
            size='medium'
            color='primaryLight'
            sx={{ mr: 2 }}
          >
            Open in Slack
          </AppButton>
        </Grid>
      </Grid>
      <S.TextContainer container>
        <Typography variant='body1'>
          {isExpanded ? text : truncatedText}
          {isExpandable && !isExpanded && (
            <AppButton
              size='medium'
              color='tertiary'
              sx={{ ml: 0.5 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              Show more
            </AppButton>
          )}
        </Typography>
        {isExpandable && isExpanded && (
          <AppButton
            size='medium'
            color='tertiary'
            sx={{ width: 'fit-content', mt: 0.5 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            Hide
          </AppButton>
        )}
      </S.TextContainer>
    </S.MainMessageContainer>
  );
};

export default MainThreadMessage;