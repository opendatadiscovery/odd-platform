import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import {
  getDataEntitiesUsageTotalCount,
  getDataEntitiesUsageUnfilledCount,
  getDataEntityClassesUsageInfo,
  getIsMainOverviewContentFetching,
} from 'redux/selectors';
import { EntityClassItem, MainSearch, SkeletonWrapper } from 'components/shared';
import { fetchDataEntitiesUsageInfo, fetchTagsList } from 'redux/thunks';
import { DataEntityClassLabelMap } from 'redux/interfaces';
import { PermissionProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import OwnerAssociation from './OwnerAssociation/OwnerAssociation';
import TopTagsList from './TopTagsList/TopTagsList';

const Overview: React.FC = () => {
  const dispatch = useAppDispatch();

  const dataEntityClassesUsageInfo = useAppSelector(getDataEntityClassesUsageInfo);
  const dataEntityUsageTotalCount = useAppSelector(getDataEntitiesUsageTotalCount);
  const dataEntityUsageUnfilledCount = useAppSelector(getDataEntitiesUsageUnfilledCount);

  const isMainOverviewContentFetching = useAppSelector(getIsMainOverviewContentFetching);

  React.useEffect(() => {
    dispatch(fetchTagsList({ page: 1, size: 20 }));
    dispatch(fetchDataEntitiesUsageInfo());
  }, []);

  return (
    <S.Container>
      {isMainOverviewContentFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => <OverviewSkeleton width={randWidth()} />}
        />
      ) : (
        <>
          <Grid container justifyContent='center' sx={{ pt: 8, pb: 9 }}>
            <MainSearch mainSearch />
          </Grid>
          <S.TagsContainer container>
            <TopTagsList />
          </S.TagsContainer>
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
        </>
      )}
      <PermissionProvider permissions={[Permission.DIRECT_OWNER_SYNC]}>
        <OwnerAssociation />
      </PermissionProvider>
    </S.Container>
  );
};

export default Overview;
