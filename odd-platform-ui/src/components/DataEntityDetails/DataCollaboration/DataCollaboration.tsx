import React from 'react';
import { useAppParams } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchDataEntityMessages, messagesListSize as size } from 'redux/thunks';
import {
  getDataEntityMessages,
  getDataEntityMessagesFetchingStatuses,
  getDataEntityMessagesPageInfo,
  getLengthOfDataEntityMessages,
  getMessageToSlackCreatingStatuses,
} from 'redux/selectors';
import MessagesList from './MessagesList/MessagesList';
import Channels from './Channels/Channels';
import * as S from './DataCollaborationStyles';
import CurrentMessage from './CurrentMessage/CurrentMessage';

const DataCollaboration: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const [channelId, setChannelId] = React.useState<string | undefined>(undefined);
  const [messageDate, setMessageDate] = React.useState('');

  const messagesByDate = useAppSelector(getDataEntityMessages);
  const messagesLength = useAppSelector(getLengthOfDataEntityMessages);
  const { lastId, lastDateTime, hasNext } = useAppSelector(getDataEntityMessagesPageInfo);
  const { isLoading: isMessagesLoading } = useAppSelector(
    getDataEntityMessagesFetchingStatuses
  );
  const { isLoading: isMessageCreating } = useAppSelector(
    getMessageToSlackCreatingStatuses
  );

  const fetchMessagesParams = React.useMemo(
    () => ({
      dataEntityId,
      channelId,
      size,
      lastMessageId: lastId,
      lastMessageDateTime: lastDateTime,
    }),
    [dataEntityId, channelId, size, lastId, lastDateTime]
  );

  React.useEffect(() => {
    dispatch(fetchDataEntityMessages(fetchMessagesParams));
  }, [fetchMessagesParams, isMessageCreating]);

  const fetchNextMessages = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(fetchDataEntityMessages(fetchMessagesParams));
  }, [fetchMessagesParams]);

  const handleSetChannelId = React.useCallback(
    (id: string | undefined) => setChannelId(id),
    [setChannelId]
  );

  const handleSetMessageDate = React.useCallback(
    (date: string) => setMessageDate(date),
    [setMessageDate]
  );

  return (
    <S.Container container>
      <Channels handleSetChannelId={handleSetChannelId} />
      <MessagesList
        messagesByDate={messagesByDate}
        messagesLength={messagesLength}
        fetchNextMessages={fetchNextMessages}
        hasNext={hasNext}
        isMessagesLoading={isMessagesLoading}
        handleSetMessageDate={handleSetMessageDate}
      />
      <CurrentMessage messageDate={messageDate} />
    </S.Container>
  );
};
export default DataCollaboration;
