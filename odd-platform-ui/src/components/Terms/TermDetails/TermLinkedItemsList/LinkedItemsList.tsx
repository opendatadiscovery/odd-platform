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
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityClassesList,
  getTermLinkedList,
  getTermLinkedListFetchingErrors,
  getTermLinkedListFetchingStatuses,
  getTermLinkedListPageInfo,
} from 'redux/selectors';
import { fetchTermLinkedList } from 'redux/thunks';
import LinkedItem from './LinkedItem/LinkedItem';
import {
  TermLinkedItemsColContainer,
  TermLinkedItemsListContainer,
  TermLinkedItemsResultsTableHeader,
} from './LinkedItemsListStyles';
import LinkedItemsListSkeleton from './LinkedItemsListSkeleton/LinkedItemsListSkeleton';

const LinkedItemsList: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();

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
      <TermLinkedItemsResultsTableHeader container sx={{ mt: 2 }} wrap='nowrap'>
        <TermLinkedItemsColContainer item $colType='colmd'>
          <Typography variant='caption'>{t('Name')}</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='collg'>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Datasource')}</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colsm'>
          <Typography variant='caption'>{t('Owner')}</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colxs'>
          <Typography variant='caption'>{t('Created')}</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colxs'>
          <Typography variant='caption'>{t('Updated')}</Typography>
        </TermLinkedItemsColContainer>
      </TermLinkedItemsResultsTableHeader>
      {isLinkedListFetching && <LinkedItemsListSkeleton />}
      <TermLinkedItemsListContainer
        $isListEmpty={!total || isLinkedListNotFetched}
        id='term-linked-items-list'
      >
        {termLinkedList && (
          <InfiniteScroll
            dataLength={termLinkedList?.length}
            next={fetchNextPage}
            hasMore={hasNext}
            loader={isLinkedListFetching && <LinkedItemsListSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='term-linked-items-list'
          >
            {termLinkedList?.map(linkedItem => (
              <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
            ))}
          </InfiniteScroll>
        )}
      </TermLinkedItemsListContainer>
      <EmptyContentPlaceholder
        text={t('No linked items')}
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

export default LinkedItemsList;
