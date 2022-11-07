import React from 'react';
import { Message } from 'redux/interfaces';
import { Grid, Typography } from '@mui/material';
import {
  AppCircularProgress,
  AppIconButton,
  EmptyContentPlaceholder,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppPaths } from 'lib/hooks';
import { useHistory } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThreadMessageSkeleton from './ThreadMessage/ThreadMessageSkeleton';
import MainThreadMessage from './MainThreadMessage/MainThreadMessage';
import ThreadMessage from './ThreadMessage/ThreadMessage';

interface ThreadContentProps {
  dataEntityId: number;
  mainMessage: Message;
  relatedMessages: Message[];
  fetchNextMessages: () => void;
  hasNext: boolean;
  isRelatedMessagesLoading: boolean;
}

const ThreadContent: React.FC<ThreadContentProps> = ({
  dataEntityId,
  mainMessage,
  relatedMessages,
  fetchNextMessages,
  hasNext,
  isRelatedMessagesLoading,
}) => {
  const history = useHistory();
  const { dataEntityCollaborationPath } = useAppPaths();

  return isRelatedMessagesLoading ? (
    <AppCircularProgress size={40} background='transparent' />
  ) : (
    <Grid
      container
      flexDirection='column'
      flexWrap='nowrap'
      alignSelf='baseline'
      pl={2}
      pt={2}
    >
      <Grid container justifyContent='space-between' alignItems='center'>
        <Typography variant='h1' component='span'>
          Thread
        </Typography>
        <AppIconButton
          sx={{ ml: 2 }}
          size='medium'
          color='unfilled'
          icon={<ClearIcon viewBox='0 0 16 16' width={24} height={24} />}
          onClick={() => history.push(dataEntityCollaborationPath(dataEntityId))}
        />
      </Grid>
      <MainThreadMessage mainMessage={mainMessage} />
      <Grid container flexDirection='column' pl={3} pr={0.5}>
        {!isRelatedMessagesLoading && relatedMessages?.length ? (
          <InfiniteScroll
            dataLength={relatedMessages?.length}
            next={fetchNextMessages}
            hasMore={hasNext}
            loader={isRelatedMessagesLoading && <ThreadMessageSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='messages-list'
          >
            {relatedMessages.map(message => (
              <ThreadMessage key={message.id} message={message} />
            ))}
          </InfiniteScroll>
        ) : (
          <EmptyContentPlaceholder text='No messages' />
        )}
      </Grid>
    </Grid>
  );
};

export default ThreadContent;
