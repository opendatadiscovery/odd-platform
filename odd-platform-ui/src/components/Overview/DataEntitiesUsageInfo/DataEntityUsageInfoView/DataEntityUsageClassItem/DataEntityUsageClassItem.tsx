import React from 'react';
import { EntityClassItem } from 'components/shared';
import { Typography } from '@mui/material';
import { DataEntityClassLabelMap } from 'redux/interfaces';
import type { DataEntityClass } from 'generated-sources';
import type {
  HandleEntityClassTypeClickParams,
  HandleEntityClassClickParams,
} from '../../DataEntitiesUsageInfo';
import * as S from './DataEntityUsageClassItemStyles';

interface DataEntityUsageClassItemProps {
  entityClass: DataEntityClass;
  handleEntityClassClick: (params: HandleEntityClassClickParams) => void;
  handleEntityClassTypeClick: (params: HandleEntityClassTypeClickParams) => void;
  itemIdx: number;
  classTotalCount: number;
}

const DataEntityUsageClassItem: React.FC<DataEntityUsageClassItemProps> = ({
  entityClass,
  itemIdx,
  classTotalCount,
  handleEntityClassClick,
  handleEntityClassTypeClick,
}) => {
  const entityClassClickParams = {
    entityId: entityClass.id,
    entityName: entityClass.name,
  };

  return (
    <S.ListItemWrapper
      key={entityClass.id}
      onClick={() => handleEntityClassClick(entityClassClickParams)}
    >
      <S.ListItem $index={itemIdx}>
        <EntityClassItem
          sx={{ ml: 0.5 }}
          key={entityClass.id}
          entityClassName={entityClass.name}
        />
        <Typography noWrap title={entityClass.name}>
          {entityClass && DataEntityClassLabelMap.get(entityClass.name)?.normal}
        </Typography>
      </S.ListItem>
      <Typography variant='h4' noWrap>
        {classTotalCount}
      </Typography>
    </S.ListItemWrapper>
  );
};

export default DataEntityUsageClassItem;
