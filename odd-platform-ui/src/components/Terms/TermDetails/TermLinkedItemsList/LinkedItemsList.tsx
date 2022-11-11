import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  EmptyContentPlaceholder,
  AppSelect,
  AppInput,
  AppMenuItem,
} from 'components/shared';
import SearchResultsSkeleton from 'components/Search/Results/SearchResultsSkeleton/SearchResultsSkeleton';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
import { useDebouncedCallback } from 'use-debounce';
import { stringFormatted } from 'lib/helpers';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityClassesList,
  getTermLinkedList,
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

const LinkedItemsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();

  const termLinkedList = useAppSelector(getTermLinkedList(termId));

  const entityClasses = useAppSelector(getDataEntityClassesList);
  const { isLoading: isLinkedListFetching } = useAppSelector(
    getTermLinkedListFetchingStatuses
  );
  const { hasNext, page, total } = useAppSelector(getTermLinkedListPageInfo);

  const [query, setQuery] = React.useState('');
  const [entityClassId, setEntityClassId] = React.useState<number | undefined>(undefined);

  const size = 50;

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchTermLinkedList({ termId, page: page + 1, size, query, entityClassId }));
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [termId]);

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
          <AppInput
            size='medium'
            placeholder='Search'
            onKeyDown={handleKeyDownSearch}
            onChange={e => setQuery(e.target.value)}
            value={query}
            customStartAdornment={{
              variant: 'search',
              showAdornment: true,
              onCLick: handleOnClickSearch,
              icon: <SearchIcon />,
            }}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!query,
              onCLick: () => {
                setQuery('');
                handleOnClickSearch();
              },
              icon: <ClearIcon />,
            }}
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
          <Typography variant='caption'>Name</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='collg'>
          <Typography variant='caption'>Namespace</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colsm'>
          <Typography variant='caption'>Datasource</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colsm'>
          <Typography variant='caption'>Owner</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colxs'>
          <Typography variant='caption'>Created</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType='colxs'>
          <Typography variant='caption'>Last Update</Typography>
        </TermLinkedItemsColContainer>
      </TermLinkedItemsResultsTableHeader>
      {isLinkedListFetching ? (
        <SearchResultsSkeleton />
      ) : (
        <TermLinkedItemsListContainer id='term-linked-items-list'>
          {termLinkedList && (
            <InfiniteScroll
              dataLength={termLinkedList?.length}
              next={fetchNextPage}
              hasMore={hasNext}
              loader={isLinkedListFetching && <SearchResultsSkeleton />}
              scrollThreshold='200px'
              scrollableTarget='term-linked-items-list'
            >
              {termLinkedList?.map(linkedItem => (
                <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
              ))}
            </InfiniteScroll>
          )}
        </TermLinkedItemsListContainer>
      )}
      {isLinkedListFetching && !total && (
        <EmptyContentPlaceholder text='No linked items' />
      )}
    </Grid>
  );
};

export default LinkedItemsList;
