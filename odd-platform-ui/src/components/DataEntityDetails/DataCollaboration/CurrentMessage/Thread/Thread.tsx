import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityMessage,
  getRelatedMessages,
  getRelatedMessagesError,
  getRelatedMessagesFetchingStatuses,
  getRelatedMessagesPageInfo,
} from 'redux/selectors';
import { fetchRelatedMessages, messagesListSize as size } from 'redux/thunks';
import { useAppParams, useAppPaths } from 'lib/hooks';
import type { DataEntityApiGetMessagesRequest } from 'generated-sources';
import { useHistory } from 'react-router-dom';
import ThreadContent from './ThreadContent/ThreadContent';

interface ThreadProps {
  messageDate: string;
}
const Thread: React.FC<ThreadProps> = ({ messageDate }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId, messageId } = useAppParams();
  const { dataEntityCollaborationPath } = useAppPaths();

  const mainMessage = useAppSelector(getDataEntityMessage(messageDate, messageId));
  const relatedMessages = useAppSelector(getRelatedMessages);
  const { lastId, hasNext } = useAppSelector(getRelatedMessagesPageInfo);
  const { isLoading: isRelatedMessagesLoading } = useAppSelector(
    getRelatedMessagesFetchingStatuses
  );
  const relatedMessagesError = useAppSelector(getRelatedMessagesError);

  const fetchRelatedMessagesParams = React.useMemo<DataEntityApiGetMessagesRequest>(
    () => ({ dataEntityId, messageId, size, lastMessageId: lastId }),
    [dataEntityId, messageId, size, lastId]
  );
  console.log('mes', messageId, hasNext);
  React.useEffect(() => {
    if (relatedMessagesError) {
      history.push(dataEntityCollaborationPath(dataEntityId));
    }
    dispatch(fetchRelatedMessages(fetchRelatedMessagesParams));
  }, [fetchRelatedMessagesParams, relatedMessagesError]);

  const fetchNextMessages = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(fetchRelatedMessages(fetchRelatedMessagesParams));
  }, [fetchRelatedMessagesParams, hasNext]);

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
