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
import { buildSearchLink } from 'lib/hooks';
import * as S from './OwnerEntitiesListStyles';
import DataEntityList from './DataEntityList/DataEntityList';
import FavoritesColumn from './FavoritesColumn/FavoritesColumn';
import RecentlyViewedColumn from './RecentlyViewedColumn/RecentlyViewedColumn';

/**
 * The Recommended section (#1815 / PRD-0002 A2). Always visible, for every audience: the **Favorites**
 * and **Popular** columns are platform-recommended for everyone (Recently Viewed will join the always-on
 * set when that feature ships). When the signed-in user is bound to an Owner, their personalised columns
 * — **My Objects**, **Upstream of my data**, **Downstream of my data** — are added. Every column is the
 * same size (the shared DataEntityList card form-factor), so no category spans the whole page.
 *
 * <p>ST-8 (#1842 / ADR D8) turns those three into deep-link widgets: each "View all" opens the catalog search
 * pre-filtered to the matching My-data scope, so the panel is a preview of a real, shareable search rather
 * than a dead end. The two lineage captions were also corrected here: they read "Upstream/Downstream
 * dependents", but a *dependent* depends on you — i.e. is downstream — while `/my/upstream` returns the
 * entities your data depends ON. The old wording was inverted for upstream, disagreed with the manual (which
 * says "Dependencies"), and would now disagree with the filter chip the link lands on.
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
        {/* ST-9 (#1843 / ADR D8) — the Popular tile becomes a deep-link widget too: "View all" opens the catalog
            search sorted by popularity (most viewed first) and narrowed to data entities that have been viewed
            (popularity_min=1 — which also keeps terms / query examples, score 0, out of the list). The tile itself
            still ranks by the LIVE exact view count while the search uses the 15-minute band snapshot, so within one
            band the two orders can differ — documented in the manual's Popularity section; converging the tile onto
            the snapshot is a separate change. */}
        <DataEntityList
          dataEntitiesList={popularEntities}
          entityListName={t('Popular')}
          entityListIcon={<PopularIcon />}
          isFetching={isPopularFetching}
          isNotFetched={isPopularNotFetched}
          viewAllTo={buildSearchLink({ sort: 'popularity', popularity: { min: 1 } })}
        />
        {isOwnerBound && (
          <>
            <DataEntityList
              dataEntitiesList={myEntities}
              entityListName={t('My Objects')}
              entityListIcon={<CatalogIcon />}
              isFetching={isMyFetching}
              isNotFetched={isMyNotFetched}
              viewAllTo={buildSearchLink({ myData: ['MY_OBJECTS'] })}
            />
            <DataEntityList
              dataEntitiesList={myEntitiesUpstream}
              entityListName={t('Upstream of my data')}
              entityListIcon={<UpstreamIcon />}
              isFetching={isUpstreamFetching}
              isNotFetched={isUpstreamNotFetched}
              viewAllTo={buildSearchLink({ myData: ['UPSTREAM'] })}
            />
            <DataEntityList
              dataEntitiesList={myEntitiesDownstream}
              entityListName={t('Downstream of my data')}
              entityListIcon={<DownstreamIcon />}
              isFetching={isDownstreamFetching}
              isNotFetched={isDownstreamNotFetched}
              viewAllTo={buildSearchLink({ myData: ['DOWNSTREAM'] })}
            />
          </>
        )}
      </S.DataEntityContainer>
    </S.Container>
  );
};

export default OwnerEntitiesList;
