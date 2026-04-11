import React, { type FC, useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import {
  AppErrorPage,
  AppMenuItem,
  AppSelect,
  EmptyContentPlaceholder,
  Input,
} from 'components/shared/elements';
import { stringFormatted } from 'lib/helpers';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityClassesList,
  getTermLinkedList,
  getTermLinkedListFetchingErrors,
  getTermLinkedListFetchingStatuses,
  getTermLinkedListPageInfo,
} from 'redux/selectors';
import { fetchTermLinkedList } from 'redux/thunks';
import { useTermsRouteParams } from 'routes';
import LinkedEntity from './LinkedEntity/LinkedEntity';
import {
  TermLinkedEntitiesColContainer,
  TermLinkedEntitiesListContainer,
  TermLinkedEntitiesResultsTableHeader,
} from './LinkedEntitiesListStyles';
import LinkedEntitiesListSkeleton from './LinkedEntitiesListSkeleton/LinkedEntitiesListSkeleton';

const LinkedEntitiesList: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { termId } = useTermsRouteParams();

  const termLinkedList = useAppSelector(getTermLinkedList(termId));

  const entityClasses = useAppSelector(getDataEntityClassesList);
  const {
    isLoading: isLinkedListFetching,
    isLoaded: isLinkedListFetched,
    isNotLoaded: isLinkedListNotFetched,
  } = useAppSelector(getTermLinkedListFetchingStatuses);
  const linkedListFetchingError = useAppSelector(getTermLinkedListFetchingErrors);
  const { hasNext, page, total } = useAppSelector(getTermLinkedListPageInfo);

  const [query, setQuery] = useState('');
  const [entityClassId, setEntityClassId] = useState<number | undefined>(undefined);

  const size = 50;

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchTermLinkedList({ termId, page: page + 1, size, query, entityClassId }));
  };

  useEffect(() => {
    dispatch(fetchTermLinkedList({ termId, page: 1, size, query, entityClassId }));
  }, []);

  const createSearch = useDebouncedCallback(() => {
    dispatch(fetchTermLinkedList({ termId, page, size, query, entityClassId }));
  }, 500);

  const handleKeyDownSearch = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') createSearch();
  };

  const handleOnClickSearch = () => createSearch();

  return (
    <Grid>
      <Grid container flexWrap='nowrap' justifyContent='flex-start' sx={{ mt: 2 }}>
        <Grid item xs={3} sx={{ mr: 1 }}>
          <Input
            variant='search-m'
            placeholder={t('Search')}
            maxWidth={640}
            onKeyDown={handleKeyDownSearch}
            onChange={e => setQuery(e.target.value)}
            value={query}
            handleSearchClick={handleOnClickSearch}
          />
        </Grid>
        <Grid item xs={2}>
          <AppSelect defaultValue='All entities' onChange={handleOnClickSearch}>
            <AppMenuItem value='All entities' onClick={() => setEntityClassId(undefined)}>
              All entities
            </AppMenuItem>
            {entityClasses?.map(entityClass => (
              <AppMenuItem
                key={entityClass.id}
                value={entityClass.id}
                onClick={() => setEntityClassId(entityClass.id)}
              >
                {stringFormatted(entityClass.name, '_', 'firstLetterOfEveryWord')}
              </AppMenuItem>
            ))}
          </AppSelect>
        </Grid>
      </Grid>
      <TermLinkedEntitiesResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
        <TermLinkedEntitiesColContainer item $colType='colmd'>
          <Typography variant='caption'>{t('Name')}</Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Datasource')}</Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Owner')}</Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colxs'>
          <Typography variant='caption'>{t('Created')}</Typography>
        </TermLinkedEntitiesColContainer>
        <TermLinkedEntitiesColContainer item $colType='colxs'>
          <Typography variant='caption'>{t('Updated')}</Typography>
        </TermLinkedEntitiesColContainer>
      </TermLinkedEntitiesResultsTableHeader>
      {isLinkedListFetching && <LinkedEntitiesListSkeleton />}
      <TermLinkedEntitiesListContainer
        $isListEmpty={!total || isLinkedListNotFetched}
        id='term-linked-entities-list'
      >
        {termLinkedList && (
          <InfiniteScroll
            dataLength={termLinkedList?.length}
            next={fetchNextPage}
            hasMore={hasNext}
            loader={isLinkedListFetching && <LinkedEntitiesListSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='term-linked-entities-list'
          >
            {termLinkedList?.map(linkedItem => (
              <LinkedEntity key={linkedItem.id} linkedEntity={linkedItem} />
            ))}
          </InfiniteScroll>
        )}
      </TermLinkedEntitiesListContainer>
      <EmptyContentPlaceholder
        text={t('No linked entities')}
        isContentLoaded={isLinkedListFetched}
        isContentEmpty={!total}
      />
      <AppErrorPage
        showError={isLinkedListNotFetched}
        error={linkedListFetchingError}
        offsetTop={194}
      />
    </Grid>
  );
};

export default LinkedEntitiesList;
