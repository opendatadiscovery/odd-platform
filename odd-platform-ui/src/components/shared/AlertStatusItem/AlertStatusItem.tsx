import React from 'react';
import capitalize from 'lodash/capitalize';
import * as S from 'components/shared/AlertStatusItem/AlertStatusItemStyles';
import { AlertStatus } from 'generated-sources';

export interface AlertStatusItemProps {
  typeName: AlertStatus;
}

const AlertStatusItem: React.FC<AlertStatusItemProps> = ({ typeName }) => (
  <S.Container title={typeName} aria-label="AlertStatusItemContainer">
    <S.FilledContainer $typeName={typeName} aria-label="AlertStatusItem">
      {capitalize(typeName)}
    </S.FilledContainer>
  </S.Container>
);

export default AlertStatusItem;
