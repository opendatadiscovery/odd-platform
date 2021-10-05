import React from 'react';
import { DataEntityTypeNameEnum } from 'generated-sources';
import { DataEntityTypeLabelMap } from 'redux/interfaces/dataentities';
import { BoxProps } from '@mui/material';
import * as S from './EntityTypeItemStyles';

interface EntityTypeItemProps extends Pick<BoxProps, 'sx'> {
  typeName: DataEntityTypeNameEnum;
  fullName?: boolean;
}

const EntityTypeItem: React.FC<EntityTypeItemProps> = ({
  typeName,
  fullName,
  sx,
}) => (
  <S.Content
    typeName={typeName}
    fullName={fullName}
    sx={sx}
    component="span"
    title={DataEntityTypeLabelMap.get(typeName)?.normal}
  >
    {DataEntityTypeLabelMap.get(typeName)?.[fullName ? 'normal' : 'short']}
  </S.Content>
);

export default EntityTypeItem;
