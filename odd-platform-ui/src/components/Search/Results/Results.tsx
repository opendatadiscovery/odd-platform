import React from 'react';
import { Grid, Typography } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import get from 'lodash/get';
import { useScrollBarWidth } from 'lib/hooks';
import {
  CountableSearchFilter,
  DataEntityClassNameEnum,
  Permission,
} from 'generated-sources';
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
import { AppButton, EmptyContentPlaceholder } from 'components/shared';
import { AddIcon } from 'components/shared/Icons';
import findKey from 'lodash/findKey';
import { WithPermissions } from 'components/shared/contexts';
import DataEntityGroupForm from '../../DataEntityDetails/DataEntityGroup/DataEntityGroupForm/DataEntityGroupForm';
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
  const searchClassIdPredicate = React.useCallback(
    (totalName: DataEntityClassNameEnum) => searchClass === totals[totalName]?.id,
    [searchClass, totals]
  );

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

  const grid = React.useMemo(() => {
    let key: S.SearchTabsNames = 'all';

    if (typeof searchClass === 'string') key = searchClass;
    if (typeof searchClass === 'number') {
      key = findKey(
        totals,
        total => (total as CountableSearchFilter)?.id === searchClass
      ) as S.SearchTabsNames;
    }

    return S.gridSizes[key];
  }, [searchClass, totals]);

  return (
    <Grid sx={{ mt: 2 }}>
      <SearchResultsTabs
        showTabsSkeleton={isSearchCreatingAndFetching}
        isHintUpdating={isSearchUpdating}
        totals={totals}
        searchClass={searchClass}
        onSearchClassChange={onSearchClassChange}
      />
      <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_CREATE}>
        <>
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
        </>
      </WithPermissions>
      <S.ResultsTableHeader container sx={{ mt: 2, pr: scrollbarWidth }} wrap='nowrap'>
        <S.SearchCol item lg={grid.lg.nm}>
          <Typography variant='caption'>Name</Typography>
        </S.SearchCol>
        {searchClassIdPredicate(DataEntityClassNameEnum.SET) && (
          <>
            <S.SearchCol item lg={grid.lg.us}>
              <Typography variant='caption'>Use</Typography>
            </S.SearchCol>
            <S.SearchCol item lg={grid.lg.rc}>
              <Typography variant='caption'>Rows/Columns</Typography>
            </S.SearchCol>
          </>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.TRANSFORMER) && (
          <>
            <S.SearchCol item lg={grid.lg.sr}>
              <Typography variant='caption'>Sources</Typography>
            </S.SearchCol>
            <S.SearchCol item lg={grid.lg.tr}>
              <Typography variant='caption'>Targets</Typography>
            </S.SearchCol>
          </>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.CONSUMER) && (
          <S.SearchCol item lg={grid.lg.sr}>
            <Typography variant='caption'>Source</Typography>
          </S.SearchCol>
        )}
        {searchClassIdPredicate(DataEntityClassNameEnum.QUALITY_TEST) && (
          <>
            <S.SearchCol item lg={grid.lg.en}>
              <Typography variant='caption'>Entities</Typography>
            </S.SearchCol>
            <S.SearchCol item lg={grid.lg.su}>
              <Typography variant='caption'>Suite URL</Typography>
            </S.SearchCol>
          </>
        )}

        {searchClassIdPredicate(DataEntityClassNameEnum.ENTITY_GROUP) && (
          <S.SearchCol item lg={grid.lg.ne}>
            <Typography variant='caption'>Number of entities</Typography>
          </S.SearchCol>
        )}
        <S.SearchCol item lg={grid.lg.nd}>
          <Typography variant='caption'>Namespace, Datasource</Typography>
        </S.SearchCol>
        <S.SearchCol item lg={grid.lg.ow}>
          <Typography variant='caption'>Owners</Typography>
        </S.SearchCol>
        <S.SearchCol item lg={grid.lg.gr}>
          <Typography variant='caption'>Groups</Typography>
        </S.SearchCol>
        <S.SearchCol item lg={grid.lg.cr}>
          <Typography variant='caption'>Created</Typography>
        </S.SearchCol>
        <S.SearchCol item lg={grid.lg.up}>
          <Typography variant='caption'>Last Update</Typography>
        </S.SearchCol>
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
                searchResult={searchResult}
                gridSizes={grid}
                searchClassIdPredicate={searchClassIdPredicate}
                showClassIcons={!searchClass || typeof searchClass === 'string'}
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
