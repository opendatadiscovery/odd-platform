import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MessagesByDate } from 'redux/interfaces';
import { EmptyContentPlaceholder } from 'components/shared';
import Message from './Message/Message';
import * as S from './MessagesListStyles';
import MessageSkeleton from './Message/MessageSkeleton';

interface MessagesListProps {
  hasNext: boolean;
  messagesLength: number;
  fetchNextMessages: () => void;
  messagesByDate: MessagesByDate;
  isMessagesLoading: boolean;
  handleSetMessageDate: (date: string) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  hasNext,
  messagesLength,
  fetchNextMessages,
  messagesByDate,
  isMessagesLoading,
  handleSetMessageDate,
}) => {
  const history = useHistory();
  const { dataEntityId, messageId: routerMessageId } = useAppParams();
  const { dataEntityCollaborationMessagePath } = useAppPaths();

  const handleMessageOnClick = React.useCallback(
    (messageId: string) => () => {
      history.push(dataEntityCollaborationMessagePath(dataEntityId, messageId));
    },
    [dataEntityId]
  );

  return (
    <S.Container container>
      {!isMessagesLoading && messagesLength ? (
        <S.MessagesContainer container id='messages-list'>
          <InfiniteScroll
            dataLength={messagesLength}
            next={fetchNextMessages}
            hasMore={hasNext}
            loader={isMessagesLoading && <MessageSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='messages-list'
          >
            {Object.entries(messagesByDate).map(([messageDate, messages], index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`${messageDate}-${index}`} container>
                <Typography variant='h5' color='texts.secondary' sx={{ py: 1 }}>
                  {messageDate}
                </Typography>
                {messages.map(message => (
                  <Message
                    key={message.id}
                    message={message}
                    isActive={routerMessageId === message.id}
                    handleSetMessageDate={handleSetMessageDate}
                    messageOnClick={handleMessageOnClick(message.id)}
                  />
                ))}
              </Grid>
            ))}
          </InfiniteScroll>
        </S.MessagesContainer>
      ) : (
        <EmptyContentPlaceholder text='No messages' />
      )}
    </S.Container>
  );
};
export default MessagesList;
