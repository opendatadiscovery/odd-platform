import React, { type FC, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  getIdentity,
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyEntities,
  getMyEntitiesDownstream,
  getMyEntitiesUpstream,
  getMyUpstreamDataEntitiesFetchingStatuses,
  getOwnership,
  getPopularDataEntitiesFetchingStatuses,
  getPopularEntities,
} from 'redux/selectors';
import {
  fetchMyDataEntitiesList,
  fetchMyDownstreamDataEntitiesList,
  fetchMyUpstreamDataEntitiesList,
  fetchPopularDataEntitiesList,
} from 'redux/thunks';
import {
  CatalogIcon,
  DownstreamIcon,
  PopularIcon,
  UpstreamIcon,
} from 'components/shared/icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import * as S from './OwnerEntitiesListStyles';
import DataEntityList from './DataEntityList/DataEntityList';
import FavoritesColumn from './FavoritesColumn/FavoritesColumn';
import RecentlyViewedColumn from './RecentlyViewedColumn/RecentlyViewedColumn';

/**
 * The Recommended section (#1815 / PRD-0002 A2). Always visible, for every audience: the **Favorites**
 * and **Popular** columns are platform-recommended for everyone (Recently Viewed will join the always-on
 * set when that feature ships). When the signed-in user is bound to an Owner, their personalised columns
 * — **My Objects**, **Upstream dependents**, **Downstream dependents** — are added. Every column is the
 * same size (the shared DataEntityList card form-factor), so no category spans the whole page.
 */
const OwnerEntitiesList: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const identity = useAppSelector(getIdentity);
  const ownership = useAppSelector(getOwnership);
  const isOwnerBound = Boolean(identity && ownership);

  const popularEntities = useAppSelector(getPopularEntities);
  const myEntities = useAppSelector(getMyEntities);
  const myEntitiesDownstream = useAppSelector(getMyEntitiesDownstream);
  const myEntitiesUpstream = useAppSelector(getMyEntitiesUpstream);

  const { isLoading: isPopularFetching, isNotLoaded: isPopularNotFetched } =
    useAppSelector(getPopularDataEntitiesFetchingStatuses);
  const { isLoading: isMyFetching, isNotLoaded: isMyNotFetched } = useAppSelector(
    getMyDataEntitiesFetchingStatuses
  );
  const { isLoading: isUpstreamFetching, isNotLoaded: isUpstreamNotFetched } =
    useAppSelector(getMyUpstreamDataEntitiesFetchingStatuses);
  const { isLoading: isDownstreamFetching, isNotLoaded: isDownstreamNotFetched } =
    useAppSelector(getMyDownstreamFetchingStatuses);

  // Popular is platform-wide → always fetched.
  useEffect(() => {
    dispatch(fetchPopularDataEntitiesList({ page: 1, size: 5 }));
  }, [dispatch]);

  // The owner-personalised columns need an Owner binding → fetch only when bound.
  useEffect(() => {
    if (!isOwnerBound) return;
    const params = { page: 1, size: 5 };
    dispatch(fetchMyDataEntitiesList(params));
    dispatch(fetchMyUpstreamDataEntitiesList(params));
    dispatch(fetchMyDownstreamDataEntitiesList(params));
  }, [dispatch, isOwnerBound]);

  return (
    <S.Container>
      <Typography variant='h1'>{t('Recommended')}</Typography>
      <S.DataEntityContainer container>
        <FavoritesColumn />
        <RecentlyViewedColumn />
        <DataEntityList
          dataEntitiesList={popularEntities}
          entityListName={t('Popular')}
          entityListIcon={<PopularIcon />}
          isFetching={isPopularFetching}
          isNotFetched={isPopularNotFetched}
        />
        {isOwnerBound && (
          <>
            <DataEntityList
              dataEntitiesList={myEntities}
              entityListName={t('My Objects')}
              entityListIcon={<CatalogIcon />}
              isFetching={isMyFetching}
              isNotFetched={isMyNotFetched}
            />
            <DataEntityList
              dataEntitiesList={myEntitiesUpstream}
              entityListName={t('Upstream dependents')}
              entityListIcon={<UpstreamIcon />}
              isFetching={isUpstreamFetching}
              isNotFetched={isUpstreamNotFetched}
            />
            <DataEntityList
              dataEntitiesList={myEntitiesDownstream}
              entityListName={t('Downstream dependents')}
              entityListIcon={<DownstreamIcon />}
              isFetching={isDownstreamFetching}
              isNotFetched={isDownstreamNotFetched}
            />
          </>
        )}
      </S.DataEntityContainer>
    </S.Container>
  );
};

export default OwnerEntitiesList;
