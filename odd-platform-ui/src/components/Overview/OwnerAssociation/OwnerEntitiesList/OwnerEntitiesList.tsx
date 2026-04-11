import React, { type FC, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  getIsOwnerEntitiesFetching,
  getMyDataEntitiesFetchingStatuses,
  getMyDownstreamFetchingStatuses,
  getMyEntities,
  getMyEntitiesDownstream,
  getMyEntitiesUpstream,
  getMyUpstreamDataEntitiesFetchingStatuses,
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
  StarIcon,
  UpstreamIcon,
} from 'components/shared/icons';
import { SkeletonWrapper } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import OwnerEntitiesListSkeleton from './OwnerEntitiesListSkeleton/OwnerEntitiesListSkeleton';
import * as S from './OwnerEntitiesListStyles';
import DataEntityList from './DataEntityList/DataEntityList';

const OwnerEntitiesList: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const myEntities = useAppSelector(getMyEntities);
  const myEntitiesDownstream = useAppSelector(getMyEntitiesDownstream);
  const myEntitiesUpstream = useAppSelector(getMyEntitiesUpstream);
  const popularEntities = useAppSelector(getPopularEntities);

  const { isLoading: isMyDataEntitiesFetching, isNotLoaded: isMyDataEntitiesNotFetched } =
    useAppSelector(getMyDataEntitiesFetchingStatuses);
  const {
    isLoading: isUpstreamDataEntitiesFetching,
    isNotLoaded: isUpstreamDataEntitiesNotFetched,
  } = useAppSelector(getMyUpstreamDataEntitiesFetchingStatuses);
  const {
    isLoading: isDownstreamDataEntitiesFetching,
    isNotLoaded: isDownstreamDataEntitiesNotFetched,
  } = useAppSelector(getMyDownstreamFetchingStatuses);
  const {
    isLoading: isPopularDataEntitiesFetching,
    isNotLoaded: isPopularDataEntitiesNotFetched,
  } = useAppSelector(getPopularDataEntitiesFetchingStatuses);
  const isOwnerEntitiesListFetching = useAppSelector(getIsOwnerEntitiesFetching);

  useEffect(() => {
    const params = { page: 1, size: 5 };
    dispatch(fetchMyDataEntitiesList(params));
    dispatch(fetchMyUpstreamDataEntitiesList(params));
    dispatch(fetchMyDownstreamDataEntitiesList(params));
    dispatch(fetchPopularDataEntitiesList(params));
  }, []);

  return (
    <>
      {isOwnerEntitiesListFetching ? (
        <SkeletonWrapper
          renderContent={({ randWidth }) => (
            <OwnerEntitiesListSkeleton width={randWidth()} />
          )}
        />
      ) : (
        <S.Container>
          <Typography variant='h1'>{t('Recommended')}</Typography>
          <S.DataEntityContainer container>
            <DataEntityList
              dataEntitiesList={myEntities}
              entityListName={t('My Objects')}
              entityListIcon={<CatalogIcon />}
              isFetching={isMyDataEntitiesFetching}
              isNotFetched={isMyDataEntitiesNotFetched}
            />
            <DataEntityList
              dataEntitiesList={myEntitiesUpstream}
              entityListName={t('Upstream dependents')}
              entityListIcon={<UpstreamIcon />}
              isFetching={isUpstreamDataEntitiesFetching}
              isNotFetched={isUpstreamDataEntitiesNotFetched}
            />
            <DataEntityList
              dataEntitiesList={myEntitiesDownstream}
              entityListName={t('Downstream dependents')}
              entityListIcon={<DownstreamIcon />}
              isFetching={isDownstreamDataEntitiesFetching}
              isNotFetched={isDownstreamDataEntitiesNotFetched}
            />
            <DataEntityList
              dataEntitiesList={popularEntities}
              entityListName={t('Popular')}
              entityListIcon={<StarIcon />}
              isFetching={isPopularDataEntitiesFetching}
              isNotFetched={isPopularDataEntitiesNotFetched}
            />
          </S.DataEntityContainer>
        </S.Container>
      )}
    </>
  );
};

export default OwnerEntitiesList;
