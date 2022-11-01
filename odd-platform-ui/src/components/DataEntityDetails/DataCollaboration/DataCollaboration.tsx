import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchDataEntityMessages, messagesListSize as size } from 'redux/thunks';
import { getDataEntityMessagesPageInfo } from 'redux/selectors';
import MessagesList from './MessagesList/MessagesList';
import Channels from './Channels/Channels';
import * as S from './DataCollaborationStyles';
import CurrentMessage from './CurrentMessage/CurrentMessage';

const DataCollaboration: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { dataEntityId, versionId } = useAppParams();
  const { datasetStructurePath } = useAppPaths();

  const [channelId, setChannelId] = React.useState<string | undefined>(undefined);

  const { lastId, lastDateTime, hasNext } = useAppSelector(getDataEntityMessagesPageInfo);

  React.useEffect(() => {
    dispatch(
      fetchDataEntityMessages({
        dataEntityId,
        channelId,
        size,
        lastMessageId: lastId,
        lastMessageDateTime: lastDateTime,
      })
    );
  }, [dataEntityId, channelId, size, lastId, lastDateTime]);

  const handleSetChannelId = React.useCallback(
    (id: string | undefined) => setChannelId(id),
    [setChannelId]
  );

  return (
    <S.Container container>
      <Channels handleSetChannelId={handleSetChannelId} />
      <MessagesList />
      <CurrentMessage />
    </S.Container>
  );
};
export default DataCollaboration;
