import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { EntityClassItem } from 'components/shared';
import { DataEntityClassLabelMap } from 'redux/interfaces';
import type { DataEntityUsageInfo } from 'generated-sources';
import * as S from './DataEntityUsageInfoViewStyles';
import type {
  HandleEntityClassClickParams,
  HandleEntityClassAndTypeClickParams,
} from '../DataEntitiesUsageInfo';

interface DataEntityUsageInfoViewProps {
  totalCount: DataEntityUsageInfo['totalCount'];
  unfilledCount: DataEntityUsageInfo['unfilledCount'];
  classesUsageInfo: DataEntityUsageInfo['dataEntityClassesInfo'];
  handleEntityClassClick: (params: HandleEntityClassClickParams) => void;
  handleEntityClassAndTypeClick: (params: HandleEntityClassAndTypeClickParams) => void;
}

const DataEntityUsageInfoView: React.FC<DataEntityUsageInfoViewProps> = ({
  totalCount,
  unfilledCount,
  classesUsageInfo,
  handleEntityClassClick,
  handleEntityClassAndTypeClick,
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
            <S.ListItemWrapper
              key={entityClass.id}
              onClick={() => {
                handleEntityClassClick({
                  entityId: entityClass.id,
                  entityName: entityClass.name,
                });
              }}
            >
              <S.ListItem $index={index}>
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
          ))}
        </S.ListItemContainer>
      </S.DataEntitiesUsageContainer>
    </Grid>
  );
};

export default DataEntityUsageInfoView;
