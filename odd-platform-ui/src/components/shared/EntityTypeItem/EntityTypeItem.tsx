import React from 'react';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { DataEntityTypeLabelMap } from 'redux/interfaces/dataentities';
import * as S from './EntityTypeItemStyles';

interface EntityTypeItemProps {
  typeName: DataEntityTypeNameEnum;
  fullName?: boolean;
  ml?: number;
}

const EntityTypeItem: React.FC<EntityTypeItemProps> = ({
  typeName,
  fullName,
  ml,
}) => (
  <S.Content
    typeName={typeName}
    fullName={fullName}
    ml={ml}
    title={DataEntityTypeLabelMap.get(typeName)?.normal}
  >
    {DataEntityTypeLabelMap.get(typeName)?.[fullName ? 'normal' : 'short']}
  </S.Content>
);

export default EntityTypeItem;
