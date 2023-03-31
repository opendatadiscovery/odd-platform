import React from 'react';
import { Typography } from '@mui/material';
import { DataEntityClassLabelMap, DataEntityClassTypeLabelMap } from 'redux/interfaces';
import type { DataEntityClass, DataEntityClassUsageInfo } from 'generated-sources';
import * as S from './DataEntitiesUsageInfoCard.styles';
import type {
  HandleEntityClassClickParams,
  HandleEntityClassTypeClickParams,
} from '../../DataEntitiesUsageInfo';

export interface DataEntityUsageInfoCardProps {
  entityClass: DataEntityClass;
  dataEntityTypesInfo: DataEntityClassUsageInfo['dataEntityTypesInfo'];
  handleEntityClassClick: (params: HandleEntityClassClickParams) => void;
  handleEntityClassTypeClick: (params: HandleEntityClassTypeClickParams) => void;
  classTotalCount: number;
}

const DataEntitiesUsageInfoCard: React.FC<DataEntityUsageInfoCardProps> = ({
  entityClass,
  classTotalCount,
  dataEntityTypesInfo,
  handleEntityClassClick,
  handleEntityClassTypeClick,
}) => {
  const entityClassClickParams = {
    entityId: entityClass.id,
    entityName: entityClass.name,
  };

  return (
    <S.Container>
      <S.Header
        role='button'
        onClick={() => handleEntityClassClick(entityClassClickParams)}
      >
        <Typography noWrap variant='h4' color='texts.action'>
          {entityClass && DataEntityClassLabelMap.get(entityClass.name)?.normal}
        </Typography>
        <Typography variant='h2' noWrap>
          {classTotalCount}
        </Typography>
      </S.Header>
      <S.TypeListContainer>
        {dataEntityTypesInfo.map(({ entityType, totalCount }) => (
          <S.TypeItem
            key={entityType.id}
            role='button'
            onClick={() =>
              handleEntityClassTypeClick({
                entityClassId: entityClass.id,
                entityClassName: entityClass.name,
                entityClassTypeId: entityType.id,
                entityClassTypeName: entityType.name,
              })
            }
          >
            <Typography variant='body1' color='texts.info'>
              {DataEntityClassTypeLabelMap.get(entityType.name)?.normal}
            </Typography>
            <Typography variant='body1' color='texts.info'>
              {totalCount}
            </Typography>
          </S.TypeItem>
        ))}
      </S.TypeListContainer>
    </S.Container>
  );
};

export default DataEntitiesUsageInfoCard;
