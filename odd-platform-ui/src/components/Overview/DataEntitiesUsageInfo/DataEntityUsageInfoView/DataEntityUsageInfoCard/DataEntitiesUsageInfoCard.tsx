import React from 'react';
import { Typography } from '@mui/material';
import { DataEntityClassLabelMap, DataEntityClassTypeLabelMap } from 'lib/constants';
import type { DataEntityClass, DataEntityClassUsageInfo } from 'generated-sources';
import { EntityClassItem } from 'components/shared/elements';
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
    <S.Wrapper>
      <S.ClassLabelContainer>
        <EntityClassItem large entityClassName={entityClass.name} />
      </S.ClassLabelContainer>
      <S.Container>
        <S.Header
          role='button'
          onClick={() => handleEntityClassClick(entityClassClickParams)}
        >
          {entityClass && (
            <Typography noWrap variant='h4' color='texts.action'>
              {DataEntityClassLabelMap.get(entityClass.name)?.plural}
            </Typography>
          )}
          <Typography variant='h4' noWrap>
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
              <Typography variant='body1' mr={0.5} whiteSpace='nowrap'>
                {DataEntityClassTypeLabelMap.get(entityType.name)?.normal}
              </Typography>
              <Typography variant='body1' color='texts.hint'>
                {totalCount}
              </Typography>
            </S.TypeItem>
          ))}
        </S.TypeListContainer>
      </S.Container>
    </S.Wrapper>
  );
};

export default DataEntitiesUsageInfoCard;
