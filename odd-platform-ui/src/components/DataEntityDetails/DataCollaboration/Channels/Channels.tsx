import React from 'react';
import { useAppParams } from 'lib/hooks';
import { DataEntityChannelsAutocomplete } from 'components/shared';
import * as S from './ChannelsStyles';

interface ChannelsProps {
  handleSetChannelId: (id: string | undefined) => void;
}

const Channels: React.FC<ChannelsProps> = ({ handleSetChannelId }) => {
  const { dataEntityId } = useAppParams();

  return (
    <S.Container container>
      <DataEntityChannelsAutocomplete
        sx={{ mt: 2.5 }}
        dataEntityId={dataEntityId}
        handleSetChannelId={handleSetChannelId}
      />
    </S.Container>
  );
};
export default Channels;
