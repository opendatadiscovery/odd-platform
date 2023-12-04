import React from 'react';
import { DataEntityChannelsAutocomplete } from 'components/shared/elements';
import { useDataEntityRouteParams } from 'routes';
import * as S from './ChannelsStyles';

interface ChannelsProps {
  handleSetChannelId: (id: string | undefined) => void;
}

const Channels: React.FC<ChannelsProps> = ({ handleSetChannelId }) => {
  const { dataEntityId } = useDataEntityRouteParams();

  return (
    <S.Container container>
      <DataEntityChannelsAutocomplete
        dataEntityId={dataEntityId}
        handleSetChannelId={handleSetChannelId}
      />
    </S.Container>
  );
};
export default Channels;
