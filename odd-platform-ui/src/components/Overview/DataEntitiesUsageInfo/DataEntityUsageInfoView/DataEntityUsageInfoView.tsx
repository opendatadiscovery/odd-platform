import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { EntityClassItem } from 'components/shared';
import { DataEntityClassLabelMap } from 'redux/interfaces';
import type { DataEntityUsageInfo } from 'generated-sources';
import * as S from './DataEntityUsageInfoViewStyles';

interface DataEntityUsageInfoViewProps {
  totalCount: DataEntityUsageInfo['totalCount'];
  unfilledCount: DataEntityUsageInfo['unfilledCount'];
  classesUsageInfo: DataEntityUsageInfo['dataEntityClassesInfo'];
}

const DataEntityUsageInfoView: React.FC<DataEntityUsageInfoViewProps> = ({
  totalCount,
  unfilledCount,
  classesUsageInfo,
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
          {classesUsageInfo?.map((item, index) => (
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
};

export default DataEntityUsageInfoView;
