import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AppAvatar, Button, WithFeature } from 'components/shared/elements';
import { type Message } from 'redux/interfaces';
import { Feature } from 'generated-sources';
import * as S from './MainThreadMessageStyles';

interface MainThreadMessageProps {
  mainMessage: Message;
}

const MainThreadMessage: React.FC<MainThreadMessageProps> = ({
  mainMessage: { usernameAvatar, username, url, text, channel },
}) => {
  const maxTextLength = 215;
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
          <WithFeature featureName={Feature.DATA_COLLABORATION}>
            <Button
              text='Open in Slack'
              to={url}
              target='_blank'
              buttonType='secondary-m'
              sx={{ mr: 2 }}
            />
          </WithFeature>
        </Grid>
      </Grid>
      <S.TextContainer container>
        <Typography variant='body1'>
          {isExpanded ? text : truncatedText}
          {isExpandable && !isExpanded && (
            <Button
              text='Show more'
              buttonType='tertiary-m'
              sx={{ ml: 0.5 }}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          )}
        </Typography>
        {isExpandable && isExpanded && (
          <Button
            text='Hide'
            buttonType='tertiary-m'
            sx={{ width: 'fit-content', mt: 0.5 }}
            onClick={() => setIsExpanded(!isExpanded)}
          />
        )}
      </S.TextContainer>
    </S.MainMessageContainer>
  );
};

export default MainThreadMessage;
