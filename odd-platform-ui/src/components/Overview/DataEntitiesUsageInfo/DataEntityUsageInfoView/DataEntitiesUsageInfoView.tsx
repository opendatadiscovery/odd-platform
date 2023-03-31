import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataEntityUsageInfo } from 'generated-sources';
import isEmpty from 'lodash/isEmpty';
import DataEntitiesUsageInfoCard from './DataEntityUsageInfoCard/DataEntitiesUsageInfoCard';
import * as S from './DataEntitiesUsageInfoViewStyles';
import type {
  HandleEntityClassClickParams,
  HandleEntityClassTypeClickParams,
} from '../DataEntitiesUsageInfo';

export interface DataEntitiesUsageInfoViewProps {
  totalCount: DataEntityUsageInfo['totalCount'];
  unfilledCount: DataEntityUsageInfo['unfilledCount'];
  classesUsageInfo: DataEntityUsageInfo['dataEntityClassesInfo'];
  handleEntityClassClick: (params: HandleEntityClassClickParams) => void;
  handleEntityClassTypeClick: (params: HandleEntityClassTypeClickParams) => void;
}

const DataEntitiesUsageInfoView: React.FC<DataEntitiesUsageInfoViewProps> = ({
  totalCount,
  unfilledCount,
  classesUsageInfo,
  handleEntityClassClick,
  handleEntityClassTypeClick,
}) => (
  <Grid container sx={{ mt: 8 }} wrap='nowrap'>
    <S.DataEntitiesUsageContainer>
      <S.UsageInfoHeader role='heading'>
        <S.DataEntitiesTotalContainer>
          <Typography variant='subtitle1'>Total entities:</Typography>
          <Typography variant='h3'>{totalCount}</Typography>
        </S.DataEntitiesTotalContainer>
        <S.UnfilledEntities>{unfilledCount} unfilled entities</S.UnfilledEntities>
      </S.UsageInfoHeader>
      {!isEmpty(classesUsageInfo) && (
        <S.ListItemContainer role='list'>
          {classesUsageInfo.map(
            ({ entityClass, totalCount: classTotalCount, dataEntityTypesInfo }) => (
              <DataEntitiesUsageInfoCard
                key={entityClass.id}
                entityClass={entityClass}
                classTotalCount={classTotalCount}
                dataEntityTypesInfo={dataEntityTypesInfo}
                handleEntityClassClick={handleEntityClassClick}
                handleEntityClassTypeClick={handleEntityClassTypeClick}
              />
            )
          )}
        </S.ListItemContainer>
      )}
    </S.DataEntitiesUsageContainer>
  </Grid>
);

export default DataEntitiesUsageInfoView;
