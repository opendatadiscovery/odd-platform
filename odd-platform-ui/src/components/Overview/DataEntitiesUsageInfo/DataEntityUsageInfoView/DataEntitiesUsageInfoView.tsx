import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
import type { DataEntityUsageInfo } from 'generated-sources';
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
}) => {
  const { t } = useTranslation();

  return (
    <Grid container sx={{ mt: 4 }}>
      <Typography variant='h1' mb={1}>
        {t('Entities')}
      </Typography>
      <S.DataEntitiesUsageContainer>
        <S.DataEntitiesTotalContainer role='heading'>
          <Box>
            <Typography variant='h4'> {t('Total entities')}</Typography>
            <Typography variant='h1'>{totalCount}</Typography>
          </Box>
          <Box>
            <S.UnfilledEntities>
              {unfilledCount} {t('unfilled entities')}
            </S.UnfilledEntities>
          </Box>
        </S.DataEntitiesTotalContainer>
        {!isEmpty(classesUsageInfo) && (
          <S.ListItemContainer role='list'>
            {classesUsageInfo.map(
              ({ entityClass, totalCount: classTotalCount, dataEntityTypesInfo }) => (
                <DataEntitiesUsageInfoCard
                  key={entityClass.id}
                  entityClass={entityClass}
                  classTotalCount={classTotalCount}
                  classesCount={classesUsageInfo.length}
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
};

export default DataEntitiesUsageInfoView;
