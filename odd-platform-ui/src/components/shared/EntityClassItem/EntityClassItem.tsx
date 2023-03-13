import React from 'react';
import { type DataEntityClassNameEnum } from 'generated-sources';
import { DataEntityClassLabelMap } from 'redux/interfaces/dataentities';
import { type BoxProps } from '@mui/material';
import * as S from './EntityClassItemStyles';

export interface EntityClassItemProps extends Pick<BoxProps, 'sx'> {
  entityClassName?: DataEntityClassNameEnum;
  fullName?: boolean;
}

const EntityClassItem: React.FC<EntityClassItemProps> = ({
  entityClassName,
  fullName,
  sx,
}) => (
  <S.Content
    $entityClassName={entityClassName}
    $fullName={fullName}
    sx={sx}
    component='span'
    title={entityClassName && DataEntityClassLabelMap.get(entityClassName)?.normal}
  >
    {entityClassName &&
      DataEntityClassLabelMap.get(entityClassName)?.[fullName ? 'normal' : 'short']}
  </S.Content>
);

export default EntityClassItem;
