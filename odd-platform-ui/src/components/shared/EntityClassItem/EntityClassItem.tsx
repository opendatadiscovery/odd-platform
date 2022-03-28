import React from 'react';
import { DataEntityClassNameEnum } from 'generated-sources';
import { DataEntityClassLabelMap } from 'redux/interfaces/dataentities';
import { BoxProps } from '@mui/material';
import * as S from './EntityClassItemStyles';

export interface EntityClassItemProps extends Pick<BoxProps, 'sx'> {
  typeName: DataEntityClassNameEnum;
  fullName?: boolean;
}

const EntityClassItem: React.FC<EntityClassItemProps> = ({
  typeName,
  fullName,
  sx,
}) => (
  <S.Content
    typeName={typeName}
    fullName={fullName}
    sx={sx}
    component="span"
    title={DataEntityClassLabelMap.get(typeName)?.normal}
  >
    {
      DataEntityClassLabelMap.get(typeName)?.[
        fullName ? 'normal' : 'short'
      ]
    }
  </S.Content>
);

export default EntityClassItem;
