import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityMessage,
  getRelatedMessages,
  getRelatedMessagesFetchingStatuses,
  getRelatedMessagesPageInfo,
} from 'redux/selectors';
import { fetchRelatedMessages, messagesListSize as size } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import { DataEntityApiGetRelatedMessagesRequest } from 'redux/interfaces';
import ThreadContent from './ThreadContent/ThreadContent';

interface ThreadProps {
  messageDate: string;
}
const Thread: React.FC<ThreadProps> = ({ messageDate }) => {
  const dispatch = useAppDispatch();
  const { dataEntityId, messageId } = useAppParams();

  const mainMessage = useAppSelector(getDataEntityMessage(messageDate, messageId));
  const relatedMessages = useAppSelector(getRelatedMessages);
  const { lastId, lastDateTime, hasNext } = useAppSelector(getRelatedMessagesPageInfo);
  const { isLoading: isRelatedMessagesLoading } = useAppSelector(
    getRelatedMessagesFetchingStatuses
  );

  const fetchRelatedMessagesParams =
    React.useMemo<DataEntityApiGetRelatedMessagesRequest>(
      () => ({
        dataEntityId,
        messageId,
        size,
        lastMessageId: lastId,
        lastMessageDateTime: lastDateTime,
      }),
      [dataEntityId, messageId, size, lastId, lastDateTime]
    );

  React.useEffect(() => {
    dispatch(fetchRelatedMessages(fetchRelatedMessagesParams));
  }, [fetchRelatedMessagesParams]);

  const fetchNextMessages = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(fetchRelatedMessages(fetchRelatedMessagesParams));
  }, [fetchRelatedMessagesParams]);

  return (
    <ThreadContent
      dataEntityId={dataEntityId}
      mainMessage={mainMessage}
      relatedMessages={relatedMessages}
      hasNext={hasNext}
      fetchNextMessages={fetchNextMessages}
      isRelatedMessagesLoading={isRelatedMessagesLoading}
    />
  );
};

export default Thread;
