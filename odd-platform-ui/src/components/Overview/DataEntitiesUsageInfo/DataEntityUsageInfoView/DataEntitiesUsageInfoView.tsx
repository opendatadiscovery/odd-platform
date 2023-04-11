import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import type { DataEntityUsageInfo } from 'generated-sources';
import isEmpty from 'lodash/isEmpty';
import * as S from './DataEntitiesUsageInfoView.styles';
import DataEntitiesUsageInfoCard from './DataEntityUsageInfoCard/DataEntitiesUsageInfoCard';
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
      <S.DataEntitiesTotalContainer role='heading'>
        <Box>
          <Typography variant='h4'>Total entities: </Typography>
          <Typography variant='h1'>{totalCount}</Typography>
        </Box>
        <Box>
          <S.UnfilledEntities>{unfilledCount} unfilled entities</S.UnfilledEntities>
        </Box>
      </S.DataEntitiesTotalContainer>
      {!isEmpty(classesUsageInfo) && (
        <>
          <S.ListItemContainer role='list'>
            {classesUsageInfo
              .slice(0, 3)
              .map(
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
          <S.ListItemContainer>
            {classesUsageInfo
              .slice(3)
              .map(
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
        </>
      )}
    </S.DataEntitiesUsageContainer>
  </Grid>
);

export default DataEntitiesUsageInfoView;
