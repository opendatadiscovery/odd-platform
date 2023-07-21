import React, { type FC } from 'react';
import { useAppDateTime } from 'lib/hooks';
import AppTooltip from 'components/shared/elements/AppTooltip/AppTooltip';
import { Typography } from '@mui/material';
import type { DataEntityStatus } from 'generated-sources';
import type { SerializeDateToNumber } from 'redux/interfaces';
import * as S from '../EntityStatus.styles';

interface DefaultEntityStatusProps {
  entityStatus: DataEntityStatus | SerializeDateToNumber<DataEntityStatus>;
  active?: boolean;
  isPointer?: boolean;
}

const DefaultEntityStatus: FC<DefaultEntityStatusProps> = ({
  entityStatus,
  active = false,
  isPointer,
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
      <AppTooltip
        title={
          <Typography variant='subtitle2' px={1} py={0.5}>
            {text}
          </Typography>
        }
      >
        <S.EntityStatus $status={status} $active={active} $isPointer>
          {status}
        </S.EntityStatus>
      </AppTooltip>
    );
  }

  return (
    <S.EntityStatus $status={entityStatus.status} $active={active} $isPointer={isPointer}>
      {entityStatus.status}
    </S.EntityStatus>
  );
};

export default DefaultEntityStatus;
