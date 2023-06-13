import React from 'react';
import { type DataEntityClassNameEnum } from 'generated-sources';
import { type BoxProps } from '@mui/material';
import { DataEntityClassLabelMap } from 'lib/constants';
import * as S from './EntityClassItem.styles';

export interface EntityClassItemProps extends Pick<BoxProps, 'sx'> {
  entityClassName?: DataEntityClassNameEnum;
  fullName?: boolean;
  large?: boolean;
}

const EntityClassItem: React.FC<EntityClassItemProps> = ({
  entityClassName,
  fullName,
  sx,
  large,
}) => (
  <S.Content
    $entityClassName={entityClassName}
    $large={large}
    sx={sx}
    component='span'
    title={entityClassName && DataEntityClassLabelMap.get(entityClassName)?.normal}
  >
    {entityClassName &&
      DataEntityClassLabelMap.get(entityClassName)?.[fullName ? 'normal' : 'short']}
  </S.Content>
);

export default EntityClassItem;
