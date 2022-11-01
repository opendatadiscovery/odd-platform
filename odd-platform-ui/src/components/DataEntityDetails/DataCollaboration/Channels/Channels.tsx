import React from 'react';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { SlackIcon } from 'components/shared/Icons';
import { AppButton, DataEntityChannelsAutocomplete } from 'components/shared';
import * as S from './ChannelsStyles';

interface ChannelsProps {
  handleSetChannelId: (id: string | undefined) => void;
}

const Channels: React.FC<ChannelsProps> = ({ handleSetChannelId }) => {
  const { dataEntityId } = useAppParams();
  const { dataEntityCollaborationCreateMessagePath } = useAppPaths();

  return (
    <S.Container container>
      <AppButton
        to={dataEntityCollaborationCreateMessagePath(dataEntityId)}
        size='medium'
        color='primaryLight'
        startIcon={<SlackIcon />}
        sx={{ py: '8px !important', width: '100%' }}
      >
        Create message
      </AppButton>
      <DataEntityChannelsAutocomplete
        sx={{ mt: 2.5 }}
        dataEntityId={dataEntityId}
        handleSetChannelId={handleSetChannelId}
      />
    </S.Container>
  );
};
export default Channels;
