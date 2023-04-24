import React from 'react';
import { useAppParams } from 'lib/hooks';
import { DataEntityChannelsAutocomplete } from 'components/shared/elements';
import * as S from './ChannelsStyles';

interface ChannelsProps {
  handleSetChannelId: (id: string | undefined) => void;
}

const Channels: React.FC<ChannelsProps> = ({ handleSetChannelId }) => {
  const { dataEntityId } = useAppParams();

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
