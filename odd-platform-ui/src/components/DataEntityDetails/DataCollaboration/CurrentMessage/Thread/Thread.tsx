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
import { useNavigate } from 'react-router-dom';
import { clearThreadState } from 'redux/slices/dataCollaboration.slice';
import ThreadContent from './ThreadContent/ThreadContent';

interface ThreadProps {
  messageDate: string;
}
const Thread: React.FC<ThreadProps> = ({ messageDate }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dataEntityId, messageId } = useAppParams();
  const { dataEntityCollaborationPath } = useAppPaths();

  const mainMessage = useAppSelector(getDataEntityMessage(messageDate, messageId));
  const relatedMessages = useAppSelector(getRelatedMessages);
  const { lastId, hasNext } = useAppSelector(getRelatedMessagesPageInfo);
  const { isLoading: isRelatedMessagesLoading, isLoaded: isRelatedMessagesLoaded } =
    useAppSelector(getRelatedMessagesFetchingStatuses);
  const relatedMessagesError = useAppSelector(getRelatedMessagesError);

  React.useEffect(() => {
    if (relatedMessagesError) {
      navigate(dataEntityCollaborationPath(dataEntityId));
    }
    dispatch(
      fetchRelatedMessages({ dataEntityId, messageId, size, lastMessageId: lastId })
    );

    return () => {
      dispatch(clearThreadState());
    };
  }, [dataEntityId, messageId, size]);

  const fetchNextMessages = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(
      fetchRelatedMessages({ dataEntityId, messageId, size, lastMessageId: lastId })
    );
  }, [dataEntityId, messageId, size, lastId, hasNext]);

  return (
    <ThreadContent
      dataEntityId={dataEntityId}
      mainMessage={mainMessage}
      relatedMessages={relatedMessages}
      hasNext={hasNext}
      fetchNextMessages={fetchNextMessages}
      isRelatedMessagesLoaded={isRelatedMessagesLoaded}
      isRelatedMessagesLoading={isRelatedMessagesLoading}
    />
  );
};

export default Thread;
