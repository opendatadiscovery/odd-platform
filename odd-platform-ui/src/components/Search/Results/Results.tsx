import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import get from 'lodash/get';
import { useScrollBarWidth } from 'lib/hooks';
import { DataEntityClassNameEnum } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityClassesDict,
  getDataEntityGroupDeletingStatuses,
  getSearchCreatingStatuses,
  getSearchEntityClass,
  getSearchFacetsSynced,
  getSearchId,
  getSearchIsCreatingAndFetching,
  getSearchIsFetching,
  getSearchResults,
  getSearchResultsPageInfo,
  getSearchTotals,
  getSearchUpdateStatuses,
} from 'redux/selectors';
import { fetchDataEntitySearchResults } from 'redux/thunks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import { SearchClass } from 'redux/interfaces';
import DataEntityGroupForm from 'components/DataEntityDetails/DataEntityGroupForm/DataEntityGroupForm';
import { AppButton, EmptyContentPlaceholder } from 'components/shared';
import { AddIcon } from 'components/shared/Icons';
import SearchResultsTabs from './SearchResultsTabs/SearchResultsTabs';
import ResultItem from './ResultItem/ResultItem';
import SearchResultsSkeleton from './SearchResultsSkeleton/SearchResultsSkeleton';
import * as S from './ResultsStyles';

const Results: React.FC = () => {
  const dispatch = useAppDispatch();
  const scrollbarWidth = useScrollBarWidth();
  const size = 30;

  const searchId = useAppSelector(getSearchId);
  const searchClass = useAppSelector(getSearchEntityClass);
  const dataEntityClassesDict = useAppSelector(getDataEntityClassesDict);
  const totals = useAppSelector(getSearchTotals);
  const searchResults = useAppSelector(getSearchResults);
  const searchFiltersSynced = useAppSelector(getSearchFacetsSynced);
  const pageInfo = useAppSelector(getSearchResultsPageInfo);

  const isSearchFetching = useAppSelector(getSearchIsFetching);
  const isSearchCreatingAndFetching = useAppSelector(getSearchIsCreatingAndFetching);
  const { isLoading: isSearchUpdating } = useAppSelector(getSearchUpdateStatuses);
  const { isLoading: isSearchCreating } = useAppSelector(getSearchCreatingStatuses);
  const { isLoaded: isDataEntityGroupDeleted } = useAppSelector(
    getDataEntityGroupDeletingStatuses
  );

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(fetchDataEntitySearchResults({ searchId, page: pageInfo.page + 1, size }));
  };

  React.useEffect(() => {
    if (searchFiltersSynced && searchId && !isSearchCreating && !isSearchUpdating) {
      fetchNextPage();
    }
  }, [searchFiltersSynced, searchId, isSearchCreating, isSearchUpdating]);

  const fetchPageAfterDEGDeleting = () => {
    if (pageInfo.page && isDataEntityGroupDeleted) {
      dispatch(fetchDataEntitySearchResults({ searchId, page: pageInfo.page, size }));
    }
  };

  React.useEffect(() => fetchPageAfterDEGDeleting(), [isDataEntityGroupDeleted]);

  const [showDEGBtn, setShowDEGBtn] = React.useState(false);
  const searchClassIdPredicate = (totalName: DataEntityClassNameEnum) =>
    searchClass === totals[totalName]?.id;

  React.useEffect(
    () => setShowDEGBtn(searchClassIdPredicate(DataEntityClassNameEnum.ENTITY_GROUP)),
    [searchClass, totals]
  );

  const onSearchClassChange = React.useCallback(
    (tabValue: SearchClass | undefined) => {
      const newSearchClass = tabValue ? get(dataEntityClassesDict, `${tabValue}`) : null;
      const facetOptionId = newSearchClass?.id ?? tabValue;
      const facetOptionName = newSearchClass?.name ?? tabValue?.toString();

      dispatch(
        changeDataEntitySearchFacet({
          facetName: 'entityClasses',
          facetOptionId,
          facetOptionName,
          facetOptionState: true,
          facetSingle: true,
        })
      );

      setShowDEGBtn(newSearchClass?.name === DataEntityClassNameEnum.ENTITY_GROUP);
    },
    [dataEntityClassesDict]
  );

  return (
    <Grid sx={{ mt: 2 }}>
      <SearchResultsTabs
        showTabsSkeleton={isSearchCreatingAndFetching}
        isHintUpdating={isSearchUpdating}
        totals={totals}
        searchClass={searchClass}
        onSearchClassChange={onSearchClassChange}
      />
      {showDEGBtn && (
        <DataEntityGroupForm
          btnCreateEl={
            <AppButton
              sx={{ mt: 2 }}
              size='medium'
              color='primaryLight'
              startIcon={<AddIcon />}
            >
              Add group
            </AppButton>
          }
        />
      )}
      <S.ResultsTableHeader container sx={{ mt: 2, pr: scrollbarWidth }} wrap='nowrap'>
        <S.ColContainer item $colType='collg'>
          <Typography variant='caption'>Name</Typography>
        </S.ColContainer>
        {searchClassIdPredicate(DataEntityClassNameEnum.SET) && (
          <>
            <S.ColContainer item $colType='colxs'>
              <Typography variant='caption'>Use</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType='colxs'>
              <Typography variant='caption'>Rows</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType='colxs'>
              <Typography variant='caption'>Columns</Typography>
            </S.ColContainer>
          </>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.TRANSFORMER) && (
          <>
            <S.ColContainer item $colType='collg'>
              <Typography variant='caption'>Sources</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType='collg'>
              <Typography variant='caption'>Targets</Typography>
            </S.ColContainer>
          </>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.QUALITY_TEST) && (
          <>
            <S.ColContainer item $colType='collg'>
              <Typography variant='caption'>Entities</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType='collg'>
              <Typography variant='caption'>Suite URL</Typography>
            </S.ColContainer>
          </>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.CONSUMER) && (
          <S.ColContainer item $colType='collg'>
            <Typography variant='caption'>Source</Typography>
          </S.ColContainer>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.ENTITY_GROUP) && (
          <S.ColContainer item $colType='colsm'>
            <Typography variant='caption'>Number of entities</Typography>
          </S.ColContainer>
        )}
        <S.ColContainer item $colType='colmd'>
          <Typography variant='caption'>Namespace</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colmd'>
          <Typography variant='caption'>Datasource</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colmd'>
          <Typography variant='caption'>Owners</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colsm'>
          <Typography variant='caption'>Created</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='colsm'>
          <Typography variant='caption'>Last Update</Typography>
        </S.ColContainer>
      </S.ResultsTableHeader>
      {isSearchCreating ? (
        <SearchResultsSkeleton />
      ) : (
        <S.ListContainer id='results-list'>
          <InfiniteScroll
            dataLength={searchResults.length}
            next={fetchNextPage}
            hasMore={pageInfo.hasNext}
            loader={isSearchFetching && <SearchResultsSkeleton />}
            scrollThreshold='200px'
            scrollableTarget='results-list'
          >
            {searchResults.map(searchResult => (
              <ResultItem
                key={searchResult.id}
                searchClass={searchClass}
                searchResult={searchResult}
                totals={totals}
              />
            ))}
          </InfiniteScroll>
          {!isSearchFetching && !pageInfo.total ? (
            <EmptyContentPlaceholder text='No matches found' />
          ) : null}
        </S.ListContainer>
      )}
    </Grid>
  );
};

export default Results;
