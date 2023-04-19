import React from 'react';
import capitalize from 'lodash/capitalize';
import type { AlertStatus } from 'generated-sources';
import * as S from 'components/shared/elements/AlertStatusItem/AlertStatusItemStyles';

interface AlertStatusItemProps {
  status: AlertStatus;
}

const AlertStatusItem: React.FC<AlertStatusItemProps> = ({ status }) => {
  const statusText = status === 'RESOLVED_AUTOMATICALLY' ? 'Resolved' : status;

  return (
    <S.Container title={status}>
      <S.FilledContainer $status={status}>{capitalize(statusText)}</S.FilledContainer>
    </S.Container>
  );
};

export default AlertStatusItem;
