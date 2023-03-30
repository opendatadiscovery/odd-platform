import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataEntityUsageInfo } from 'generated-sources';
import DataEntityUsageInfoCard from './DataEntityUsageInfoCard/DataEntityUsageInfoCard';
import * as S from './DataEntityUsageInfoViewStyles';
import type {
  HandleEntityClassClickParams,
  HandleEntityClassTypeClickParams,
} from '../DataEntitiesUsageInfo';

interface DataEntityUsageInfoViewProps {
  totalCount: DataEntityUsageInfo['totalCount'];
  unfilledCount: DataEntityUsageInfo['unfilledCount'];
  classesUsageInfo: DataEntityUsageInfo['dataEntityClassesInfo'];
  handleEntityClassClick: (params: HandleEntityClassClickParams) => void;
  handleEntityClassTypeClick: (params: HandleEntityClassTypeClickParams) => void;
}

const DataEntityUsageInfoView: React.FC<DataEntityUsageInfoViewProps> = ({
  totalCount,
  unfilledCount,
  classesUsageInfo,
  handleEntityClassClick,
  handleEntityClassTypeClick,
}) => (
  <Grid container sx={{ mt: 8 }} wrap='nowrap'>
    <S.DataEntitiesUsageContainer>
      <S.UsageInfoHeader>
        <S.DataEntitiesTotalContainer>
          <Typography variant='subtitle1'>Total entities</Typography>
          <Typography variant='h3'>{totalCount}</Typography>
        </S.DataEntitiesTotalContainer>
        <S.UnfilledEntities>{unfilledCount} unfilled entities</S.UnfilledEntities>
      </S.UsageInfoHeader>
      <S.ListItemContainer>
        {classesUsageInfo.map(
          ({ entityClass, totalCount: classTotalCount, dataEntityTypesInfo }) => (
            <DataEntityUsageInfoCard
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
    </S.DataEntitiesUsageContainer>
  </Grid>
);

export default DataEntityUsageInfoView;
