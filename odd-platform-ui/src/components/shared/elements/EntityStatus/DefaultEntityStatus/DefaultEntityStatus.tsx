import React, { type FC } from 'react';
import { useAppDateTime } from 'lib/hooks';
import Tooltip from 'components/shared/elements/Tooltip/Tooltip';
import { Typography } from '@mui/material';
import type { DataEntityStatus } from 'generated-sources';
import * as S from '../EntityStatus.styles';

interface DefaultEntityStatusProps {
  entityStatus: DataEntityStatus;
  disablePointerEvents?: boolean;
}

const DefaultEntityStatus: FC<DefaultEntityStatusProps> = ({
  entityStatus,
  disablePointerEvents,
}) => {
  const { formatDistanceToNow } = useAppDateTime();
  const { status, statusSwitchTime } = entityStatus;

  const isTimeSensitiveStatus =
    ['DRAFT', 'DEPRECATED', 'DELETED'].includes(status) && statusSwitchTime;
  const formattedToNowDate = isTimeSensitiveStatus
    ? formatDistanceToNow(statusSwitchTime)
    : '';

  const text =
    status === 'DRAFT' || status === 'DEPRECATED'
      ? `Update to deleted status in ${formattedToNowDate}`
      : `Will be deleted in ${formattedToNowDate}`;

  if (isTimeSensitiveStatus) {
    return (
      <Tooltip
        content={
          <Typography variant='subtitle2' px={1} py={0.5}>
            {text}
          </Typography>
        }
      >
        <S.EntityStatus $status={status}>{status}</S.EntityStatus>
      </Tooltip>
    );
  }

  return (
    <S.EntityStatus
      $status={entityStatus.status}
      $disablePointerEvents={disablePointerEvents}
    >
      {entityStatus.status}
    </S.EntityStatus>
  );
};

export default DefaultEntityStatus;
