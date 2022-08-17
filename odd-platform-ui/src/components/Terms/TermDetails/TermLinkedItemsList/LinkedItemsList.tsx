import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DataEntity, DataEntityClass } from 'generated-sources';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SearchResultsSkeleton from 'components/Search/Results/SearchResultsSkeleton/SearchResultsSkeleton';
import LinkedItem from 'components/Terms/TermDetails/TermLinkedItemsList/LinkedItem/LinkedItem';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppInput from 'components/shared/AppInput/AppInput';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import SearchIcon from 'components/shared/Icons/SearchIcon';
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
import {
  TermLinkedItemsColContainer,
  TermLinkedItemsListContainer,
  TermLinkedItemsResultsTableHeader,
} from './LinkedItemsListStyles';

const LinkedItemsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();

  const termLinkedList: Array<DataEntity> = useAppSelector(state =>
    getTermLinkedList(state, termId)
  );

  const entityClasses: Array<DataEntityClass> = useAppSelector(
    getDataEntityClassesList
  );
  const { isLoading: isLinkedListFetching } = useAppSelector(
    getTermLinkedListFetchingStatuses
  );
  const pageInfo = useAppSelector(getTermLinkedListPageInfo);

  const [searchText, setSearchText] = React.useState<string>('');
  const [selectedClassId, setSelectedClassId] = React.useState<
    number | undefined
  >(undefined);

  const pageSize = 50;

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;

    dispatch(
      fetchTermLinkedList({
        termId,
        page: pageInfo.page + 1,
        size: pageSize,
        query: searchText || '',
        entityClassId: selectedClassId,
      })
    );
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [termId]);

  const createSearch = useDebouncedCallback(() => {
    dispatch(
      fetchTermLinkedList({
        termId,
        page: pageInfo?.page || 1,
        size: pageSize,
        query: searchText || '',
        entityClassId: selectedClassId,
      })
    );
  }, 500);

  const handleKeyDownSearch = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      createSearch();
    }
  };

  const handleOnClickSearch = () => createSearch();

  return (
    <Grid>
      <Grid
        container
        flexWrap="nowrap"
        justifyContent="flex-start"
        sx={{ mt: 2 }}
      >
        <Grid item xs={3} sx={{ mr: 1 }}>
          <AppInput
            size="medium"
            placeholder="Search"
            onKeyDown={handleKeyDownSearch}
            onChange={e => setSearchText(e.target.value)}
            value={searchText}
            customStartAdornment={{
              variant: 'search',
              showAdornment: true,
              onCLick: handleOnClickSearch,
              icon: <SearchIcon />,
            }}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!searchText,
              onCLick: () => {
                setSearchText('');
                handleOnClickSearch();
              },
              icon: <ClearIcon />,
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <AppSelect
            defaultValue="All entities"
            onChange={handleOnClickSearch}
          >
            <AppMenuItem
              value="All entities"
              onClick={() => setSelectedClassId(undefined)}
            >
              All entities
            </AppMenuItem>
            {entityClasses?.map(entityClass => (
              <AppMenuItem
                key={entityClass.id}
                value={entityClass.id}
                onClick={() => setSelectedClassId(entityClass.id)}
              >
                {stringFormatted(
                  entityClass.name,
                  '_',
                  'firstLetterOfEveryWord'
                )}
              </AppMenuItem>
            ))}
          </AppSelect>
        </Grid>
      </Grid>
      <TermLinkedItemsResultsTableHeader
        container
        sx={{ mt: 2 }}
        wrap="nowrap"
      >
        <TermLinkedItemsColContainer item $colType="colmd">
          <Typography variant="caption">Name</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="collg">
          <Typography variant="caption">Namespace</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colsm">
          <Typography variant="caption">Datasource</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colsm">
          <Typography variant="caption">Owner</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colxs">
          <Typography variant="caption">Created</Typography>
        </TermLinkedItemsColContainer>
        <TermLinkedItemsColContainer item $colType="colxs">
          <Typography variant="caption">Last Update</Typography>
        </TermLinkedItemsColContainer>
      </TermLinkedItemsResultsTableHeader>
      {isLinkedListFetching ? (
        <SearchResultsSkeleton />
      ) : (
        <TermLinkedItemsListContainer id="term-linked-items-list">
          {termLinkedList && (
            <InfiniteScroll
              dataLength={termLinkedList?.length}
              next={fetchNextPage}
              hasMore={!!pageInfo?.hasNext}
              loader={isLinkedListFetching && <SearchResultsSkeleton />}
              scrollThreshold="200px"
              scrollableTarget="term-linked-items-list"
            >
              {termLinkedList?.map(linkedItem => (
                <LinkedItem key={linkedItem.id} linkedItem={linkedItem} />
              ))}
            </InfiniteScroll>
          )}
        </TermLinkedItemsListContainer>
      )}
      {isLinkedListFetching && !pageInfo?.total && (
        <EmptyContentPlaceholder text="No linked items" />
      )}
    </Grid>
  );
};

export default LinkedItemsList;
