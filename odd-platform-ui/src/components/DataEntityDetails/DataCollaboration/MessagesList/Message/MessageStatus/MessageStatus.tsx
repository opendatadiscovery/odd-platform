import React from 'react';
import { MessageState } from 'generated-sources';
import * as S from './MessageStatus.styles';

type MessageStatusProps = {
  status: MessageState | undefined;
};

const MESSAGE_STATUS_NAME_MAP = {
  [MessageState.PENDING_SEND]: 'Pending',
  [MessageState.SENT]: 'Sent',
  [MessageState.EXTERNAL]: 'External',
  [MessageState.DELETED]: 'Deleted',
  [MessageState.ERROR_SENDING]: 'Error',
} as const;

const MessageStatus = ({ status }: MessageStatusProps) => {
  if (status === undefined) return null;

  return (
    <S.Container variant='body2' $status={status}>
      {MESSAGE_STATUS_NAME_MAP[status]}
    </S.Container>
  );
};

export default MessageStatus;
