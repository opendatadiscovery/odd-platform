import { Grid } from '@mui/material';
import React from 'react';
import { getIdentityFetchingStatuses } from 'redux/selectors';
import { MainSearch, SkeletonWrapper } from 'components/shared/elements';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import { useAppInfo } from 'lib/hooks/api';
import Domains from 'components/Overview/Domains/Domains';
import { useGetPopularTags } from 'lib/hooks/api/tags';
import DataEntitiesUsageInfo from './DataEntitiesUsageInfo/DataEntitiesUsageInfo';
import OverviewSkeleton from './OverviewSkeleton/OverviewSkeleton';
import * as S from './OverviewStyles';
import OwnerAssociation from './OwnerAssociation/OwnerAssociation';
import TopTagsList from './TopTagsList/TopTagsList';
import Directory from './Directory/Directory';

const Overview: React.FC = () => {
  const { isLoading: isIdentityFetching } = useAppSelector(getIdentityFetchingStatuses);
  const { isLoading: isTagsFetching, data: tags } = useGetPopularTags({
    page: 1,
    size: 30,
  });
  const { data: appInfo } = useAppInfo();
  const isShowOwnerAssociation = Boolean(
    appInfo?.authType && appInfo.authType !== 'DISABLED'
  );

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
      <S.TagsContainer container>{tags && <TopTagsList tags={tags} />}</S.TagsContainer>
      <Domains />
      <DataEntitiesUsageInfo />
      <Directory />
      {isShowOwnerAssociation && (
        <WithPermissionsProvider
          allowedPermissions={[Permission.DIRECT_OWNER_SYNC]}
          resourcePermissions={[]}
          Component={OwnerAssociation}
        />
      )}
    </S.Container>
  );
};

export default Overview;
