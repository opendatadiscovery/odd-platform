import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { EntityClassItem } from 'components/shared/elements';
import { DataEntityClassLabelMap } from 'redux/interfaces';
import { type DataEntityClassUsageInfo } from 'generated-sources';
import * as S from './DataEntitiesUsageInfoStyles';

interface DataEntitiesUsageInfoProps {
  dataEntityUsageTotalCount: number;
  dataEntityUsageUnfilledCount: number;
  dataEntityClassesUsageInfo: DataEntityClassUsageInfo[];
  isUsageInfoNotFetched: boolean;
}

const DataEntitiesUsageInfo: React.FC<DataEntitiesUsageInfoProps> = ({
  dataEntityUsageTotalCount,
  dataEntityClassesUsageInfo,
  dataEntityUsageUnfilledCount,
  isUsageInfoNotFetched,
}) =>
  isUsageInfoNotFetched ? null : (
    <Grid container sx={{ mt: 8 }} wrap='nowrap'>
      <S.DataEntitiesUsageContainer>
        <S.DataEntitiesTotalContainer>
          <Box>
            <Typography variant='h4'>Total entities</Typography>
            <Typography variant='h1'>{dataEntityUsageTotalCount}</Typography>
          </Box>
          <Box>
            <S.UnfilledEntities>
              {dataEntityUsageUnfilledCount} unfilled entities
            </S.UnfilledEntities>
          </Box>
        </S.DataEntitiesTotalContainer>
        <S.ListItemContainer>
          {dataEntityClassesUsageInfo?.map((item, index) => (
            <S.ListItemWrapper key={item?.entityClass?.id}>
              <S.ListItem $index={index}>
                <EntityClassItem
                  sx={{ ml: 0.5 }}
                  key={item?.entityClass?.id}
                  entityClassName={item?.entityClass?.name}
                />
                <Typography noWrap title={item?.entityClass?.name}>
                  {item.entityClass &&
                    DataEntityClassLabelMap.get(item.entityClass.name)?.normal}
                </Typography>
              </S.ListItem>
              <Typography variant='h4' noWrap>
                {item.totalCount}
              </Typography>
            </S.ListItemWrapper>
          ))}
        </S.ListItemContainer>
      </S.DataEntitiesUsageContainer>
    </Grid>
  );

export default DataEntitiesUsageInfo;
