import { Grid } from '@mui/material';
import React from 'react';
import {
  getDataEntitiesUsageTotalCount,
  getDataEntitiesUsageUnfilledCount,
  getDataEntityClassesUsageInfo,
  getDataEntityUsageInfoFetchingStatuses,
  getIsMainOverviewContentFetching,
  getTagListFetchingStatuses,
  getTagsList,
} from 'redux/selectors';
import { MainSearch, SkeletonWrapper } from 'components/shared/elements';
import { fetchDataEntitiesUsageInfo, fetchTagsList } from 'redux/thunks';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import DataEntitiesUsageInfo from './DataEntitiesUsageInfo/DataEntitiesUsageInfo';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import OwnerAssociation from './OwnerAssociation/OwnerAssociation';
import TopTagsList from './TopTagsList/TopTagsList';

const Overview: React.FC = () => {
  const dispatch = useAppDispatch();

  const dataEntityClassesUsageInfo = useAppSelector(getDataEntityClassesUsageInfo);
  const dataEntityUsageTotalCount = useAppSelector(getDataEntitiesUsageTotalCount);
  const dataEntityUsageUnfilledCount = useAppSelector(getDataEntitiesUsageUnfilledCount);
  const topTags = useAppSelector(getTagsList);
  const { isNotLoaded: isUsageInfoNotFetched } = useAppSelector(
    getDataEntityUsageInfoFetchingStatuses
  );
  const { isNotLoaded: isTagsNotFetched } = useAppSelector(getTagListFetchingStatuses);

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
            <TopTagsList topTags={topTags} isTagsNotFetched={isTagsNotFetched} />
          </S.TagsContainer>
          <DataEntitiesUsageInfo
            dataEntityClassesUsageInfo={dataEntityClassesUsageInfo}
            dataEntityUsageTotalCount={dataEntityUsageTotalCount}
            dataEntityUsageUnfilledCount={dataEntityUsageUnfilledCount}
            isUsageInfoNotFetched={isUsageInfoNotFetched}
          />
          <WithPermissionsProvider
            allowedPermissions={[Permission.DIRECT_OWNER_SYNC]}
            resourcePermissions={[]}
            Component={OwnerAssociation}
          />
        </>
      )}
    </S.Container>
  );
};

export default Overview;
