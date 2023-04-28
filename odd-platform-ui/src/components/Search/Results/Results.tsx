import React from 'react';
import { Grid } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import get from 'lodash/get';
import { DataEntityClassNameEnum, Permission } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityClassesDict,
  getSearchCreatingStatuses,
  getSearchEntityClass,
  getSearchFacetsSynced,
  getSearchId,
  getSearchIsCreatingAndFetching,
  getSearchIsFetching,
  getSearchResults,
  getSearchResultsError,
  getSearchResultsFetchStatuses,
  getSearchResultsPageInfo,
  getSearchTotals,
  getSearchUpdateStatuses,
} from 'redux/selectors';
import { fetchDataEntitySearchResults } from 'redux/thunks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import type { SearchClass } from 'redux/interfaces';
import {
  Button,
  AppErrorPage,
  EmptyContentPlaceholder,
} from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import findKey from 'lodash/findKey';
import { WithPermissions } from 'components/shared/contexts';
import omit from 'lodash/omit';
import TableHeader from './TableHeader/TableHeader';
import DataEntityGroupForm from '../../DataEntityDetails/DataEntityGroup/DataEntityGroupForm/DataEntityGroupForm';
import SearchResultsTabs from './SearchResultsTabs/SearchResultsTabs';
import ResultItem from './ResultItem/ResultItem';
import SearchResultsSkeleton from './SearchResultsSkeleton/SearchResultsSkeleton';
import * as S from './ResultsStyles';

const Results: React.FC = () => {
  const dispatch = useAppDispatch();
  const size = 30;

  const searchId = useAppSelector(getSearchId);
  const searchClass = useAppSelector(getSearchEntityClass);
  const dataEntityClassesDict = useAppSelector(getDataEntityClassesDict);
  const searchTotals = useAppSelector(getSearchTotals);
  const searchResults = useAppSelector(getSearchResults);
  const searchResultsError = useAppSelector(getSearchResultsError);
  const searchFiltersSynced = useAppSelector(getSearchFacetsSynced);
  const { total, page, hasNext } = useAppSelector(getSearchResultsPageInfo);

  const isSearchFetching = useAppSelector(getSearchIsFetching);
  const isSearchCreatingAndFetching = useAppSelector(getSearchIsCreatingAndFetching);
  const { isLoading: isSearchUpdating } = useAppSelector(getSearchUpdateStatuses);
  const { isNotLoaded: isSearchResultsNotLoaded } = useAppSelector(
    getSearchResultsFetchStatuses
  );
  const { isLoading: isSearchCreating } = useAppSelector(getSearchCreatingStatuses);

  const [showDEGBtn, setShowDEGBtn] = React.useState(false);

  const isCurrentSearchClass = React.useCallback(
    (totalName: DataEntityClassNameEnum) => searchClass === searchTotals[totalName]?.id,
    [searchClass, searchTotals]
  );

  const fetchNextPage = React.useCallback(() => {
    if (!hasNext) return;
    dispatch(fetchDataEntitySearchResults({ searchId, page: page + 1, size }));
  }, [hasNext, searchId, page, size]);

  React.useEffect(() => {
    if (searchFiltersSynced && searchId && !isSearchCreating && !isSearchUpdating) {
      fetchNextPage();
      setShowDEGBtn(isCurrentSearchClass(DataEntityClassNameEnum.ENTITY_GROUP));
    }
  }, [searchFiltersSynced, searchId, isSearchCreating, isSearchUpdating]);

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
    },
    [dataEntityClassesDict]
  );

  const grid = React.useMemo(() => {
    let key: S.SearchTabsNames = 'all';

    if (typeof searchClass === 'string') key = searchClass;
    if (typeof searchClass === 'number') {
      key = findKey(
        omit(searchTotals, 'myObjectsTotal', 'all'),
        searchTotal => searchTotal?.id === searchClass
      ) as S.SearchTabsNames;
    }

    return S.gridSizes[key];
  }, [searchClass, searchTotals]);

  return (
    <Grid sx={{ mt: 2 }}>
      <SearchResultsTabs
        showTabsSkeleton={isSearchCreatingAndFetching}
        isHintUpdating={isSearchUpdating}
        totals={searchTotals}
        searchClass={searchClass}
        onSearchClassChange={onSearchClassChange}
      />
      <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_CREATE}>
        {showDEGBtn && (
          <DataEntityGroupForm
            btnCreateEl={
              <Button
                text='Add group'
                sx={{ mt: 2 }}
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        )}
      </WithPermissions>
      <TableHeader grid={grid} isCurrentSearchClass={isCurrentSearchClass} />
      {isSearchCreating && <SearchResultsSkeleton grid={grid} />}
      {!isSearchCreatingAndFetching && !isSearchResultsNotLoaded && (
        <S.ListContainer id='results-list'>
          <InfiniteScroll
            dataLength={searchResults.length}
            next={fetchNextPage}
            hasMore={hasNext}
            loader={isSearchFetching && <SearchResultsSkeleton grid={grid} />}
            scrollThreshold='200px'
            scrollableTarget='results-list'
          >
            {searchResults.map(searchResult => (
              <ResultItem
                key={searchResult.id}
                searchResult={searchResult}
                gridSizes={grid}
                searchClassIdPredicate={isCurrentSearchClass}
                showClassIcons={!searchClass || typeof searchClass === 'string'}
              />
            ))}
          </InfiniteScroll>
          <EmptyContentPlaceholder
            isContentLoaded={!isSearchFetching}
            isContentEmpty={!total}
            text='No matches found'
          />
        </S.ListContainer>
      )}
      <AppErrorPage
        showError={isSearchResultsNotLoaded}
        error={searchResultsError}
        offsetTop={210}
      />
    </Grid>
  );
};

export default Results;
