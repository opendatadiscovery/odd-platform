import { Grid } from '@mui/material';
import React from 'react';
import { getIdentityFetchingStatuses, getTagListFetchingStatuses } from 'redux/selectors';
import { MainSearch, SkeletonWrapper } from 'components/shared/elements';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import Domains from 'components/Overview/Domains/Domains';
import DataEntitiesUsageInfo from './DataEntitiesUsageInfo/DataEntitiesUsageInfo';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import OwnerAssociation from './OwnerAssociation/OwnerAssociation';
import TopTagsList from './TopTagsList/TopTagsList';
import Directory from './Directory/Directory';

const Overview: React.FC = () => {
  const { isLoading: isTagsFetching } = useAppSelector(getTagListFetchingStatuses);
  const { isLoading: isIdentityFetching } = useAppSelector(getIdentityFetchingStatuses);

  const isLoading = React.useMemo(
    () => isIdentityFetching || isTagsFetching,
    [isIdentityFetching, isTagsFetching]
  );

  if (isLoading) {
    return (
      <S.Container>
        <SkeletonWrapper
          renderContent={({ randWidth }) => <OverviewSkeleton width={randWidth()} />}
        />
      </S.Container>
    );
  }

  return (
    <S.Container>
      <Grid container justifyContent='center' sx={{ pt: 4, pb: 5 }}>
        <MainSearch mainSearch />
      </Grid>
      <S.TagsContainer container>
        <TopTagsList />
      </S.TagsContainer>
      <Domains />
      <DataEntitiesUsageInfo />
      <Directory />
      <WithPermissionsProvider
        allowedPermissions={[Permission.DIRECT_OWNER_SYNC]}
        resourcePermissions={[]}
        Component={OwnerAssociation}
      />
    </S.Container>
  );
};

export default Overview;
