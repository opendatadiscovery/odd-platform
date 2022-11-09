import React from 'react';
import capitalize from 'lodash/capitalize';
import * as S from 'components/shared/AlertStatusItem/AlertStatusItemStyles';
import { AlertStatus } from 'generated-sources';

interface AlertStatusItemProps {
  typeName: AlertStatus;
}

const AlertStatusItem: React.FC<AlertStatusItemProps> = ({ typeName }) => (
  <S.Container title={typeName}>
    <S.FilledContainer $typeName={typeName}>{capitalize(typeName)}</S.FilledContainer>
  </S.Container>
);

export default AlertStatusItem;
