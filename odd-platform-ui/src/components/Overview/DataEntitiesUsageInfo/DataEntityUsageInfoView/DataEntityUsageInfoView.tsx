import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import type { DataEntityUsageInfo } from 'generated-sources';
import DataEntityUsageClassItem from './DataEntityUsageClassItem/DataEntityUsageClassItem';
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
}) => {
  const a = 1;

  return (
    <Grid container sx={{ mt: 8 }} wrap='nowrap'>
      <S.DataEntitiesUsageContainer>
        <S.DataEntitiesTotalContainer>
          <Box>
            <Typography variant='h4'>Total entities</Typography>
            <Typography variant='h1'>{totalCount}</Typography>
          </Box>
          <Box>
            <S.UnfilledEntities>{unfilledCount} unfilled entities</S.UnfilledEntities>
          </Box>
        </S.DataEntitiesTotalContainer>
        <S.ListItemContainer>
          {classesUsageInfo.map(({ entityClass, totalCount: classTotalCount }, index) => (
            <DataEntityUsageClassItem
              entityClass={entityClass}
              classTotalCount={classTotalCount}
              itemIdx={index}
              handleEntityClassClick={handleEntityClassClick}
              handleEntityClassTypeClick={handleEntityClassTypeClick}
            />
          ))}
        </S.ListItemContainer>
      </S.DataEntitiesUsageContainer>
    </Grid>
  );
};

export default DataEntityUsageInfoView;
