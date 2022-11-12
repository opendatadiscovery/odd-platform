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
import { clearCollaborationState } from 'redux/slices/dataCollaboration.slice';
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
  const { lastId, hasNext } = useAppSelector(getDataEntityMessagesPageInfo);
  const { isLoading: isMessagesLoading, isLoaded: isMessagesLoaded } = useAppSelector(
    getDataEntityMessagesFetchingStatuses
  );
  const { isLoading: isMessageCreating } = useAppSelector(
    getMessageToSlackCreatingStatuses
  );

  React.useEffect(() => {
    dispatch(
      fetchDataEntityMessages({ dataEntityId, channelId, size, lastMessageId: lastId })
    );

    return () => {
      dispatch(clearCollaborationState());
    };
  }, [dataEntityId, channelId, isMessageCreating]);

  const fetchNextMessages = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(
      fetchDataEntityMessages({ dataEntityId, channelId, size, lastMessageId: lastId })
    );
  }, [dataEntityId, channelId, hasNext, lastId]);

  const handleSetChannelId = React.useCallback(
    (id: string | undefined) => setChannelId(id),
    [setChannelId]
  );

  const handleSetMessageDate = React.useCallback(
    (date: string) => {
      setMessageDate(date);
    },
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
        isMessagesLoaded={isMessagesLoaded}
        handleSetMessageDate={handleSetMessageDate}
      />
      <CurrentMessage messageDate={messageDate} />
    </S.Container>
  );
};
export default DataCollaboration;
