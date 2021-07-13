import React from 'react';
import { CircularProgress, Grid, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import cx from 'classnames';
import { get, Dictionary } from 'lodash';
import {
  DataEntityTypeNameEnum,
  DataEntity,
  SearchApiGetSearchResultsRequest,
  DataEntityType,
} from 'generated-sources';
import {
  CurrentPageInfo,
  SearchTotalsByName,
  SearchType,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import SearchResultsSkeletonWrapper from 'components/Search/Results/SearchResultsSkeletonWrapper/SearchResultsSkeletonWrapper';
import ResultItem from './ResultItem/ResultItem';
import { StylesType } from './ResultsStyles';

interface ResultsProps extends StylesType {
  dataEntityTypesByName: Dictionary<DataEntityType>;
  searchId: string;
  searchType?: SearchType;
  searchResults: DataEntity[];
  pageInfo: CurrentPageInfo;
  searchFiltersSynced: boolean;
  isFetching: boolean;
  totals: SearchTotalsByName;
  getDataEntitiesSearchResults: (
    params: SearchApiGetSearchResultsRequest
  ) => void;
}

const Results: React.FC<ResultsProps> = ({
  classes,
  dataEntityTypesByName,
  searchId,
  searchType,
  searchResults,
  pageInfo,
  totals,
  searchFiltersSynced,
  isFetching,
  getDataEntitiesSearchResults,
}) => {
  const dispatch = useDispatch();

  const tabs: AppTabItem<SearchType>[] = [
    {
      name: 'All',
      hint: totals.all,
      value: 'all',
    },
    {
      name: 'My Objects',
      hint: totals.myObjectsTotal,
      value: 'my',
    },
    {
      name: 'Datasets',
      hint: totals[DataEntityTypeNameEnum.SET]?.count || 0,
      value: totals[DataEntityTypeNameEnum.SET]?.id,
    },
    {
      name: 'Transformers',
      hint: totals[DataEntityTypeNameEnum.TRANSFORMER]?.count || 0,
      value: totals[DataEntityTypeNameEnum.TRANSFORMER]?.id,
    },
    {
      name: 'Data Consumers',
      hint: totals[DataEntityTypeNameEnum.CONSUMER]?.count || 0,
      value: totals[DataEntityTypeNameEnum.CONSUMER]?.id,
    },
    {
      name: 'Data Inputs',
      hint: totals[DataEntityTypeNameEnum.INPUT]?.count || 0,
      value: totals[DataEntityTypeNameEnum.INPUT]?.id,
    },
    {
      name: 'Quality Tests',
      hint: totals[DataEntityTypeNameEnum.QUALITY_TEST]?.count || 0,
      value: totals[DataEntityTypeNameEnum.QUALITY_TEST]?.id,
    },
  ];

  const [selectedTab] = React.useState<number>(() =>
    searchType ? tabs.findIndex(tab => tab.value === searchType) : 0
  );

  const onSearchTypeChange = (newTypeIndex: number) => {
    const newType = tabs[newTypeIndex]?.value
      ? get(dataEntityTypesByName, `${tabs[newTypeIndex].value}`)
      : null;
    dispatch(
      actions.changeDataEntitySearchFilterAction({
        facetName: 'types',
        facetOptionId: newType?.id || tabs[newTypeIndex].value,
        facetOptionName:
          newType?.name || tabs[newTypeIndex].value?.toString(),
        facetOptionState: true,
        facetSingle: true,
      })
    );
  };

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    getDataEntitiesSearchResults({
      searchId,
      page: pageInfo.page + 1,
      size: 30,
    });
  };

  React.useEffect(() => {
    if (searchFiltersSynced) {
      fetchNextPage();
    }
  }, [searchFiltersSynced, searchId]);

  const searchResultsContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className={classes.container}>
      <AppTabs
        variant="primary"
        classes={{ container: classes.tabsContainer }}
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={onSearchTypeChange}
      />
      <Grid
        container
        className={cx(classes.resultsTable, classes.resultsTableHeader)}
        wrap="nowrap"
      >
        <Grid item className={cx(classes.col, classes.collg)}>
          <Typography variant="caption">Name</Typography>
        </Grid>
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.SET]?.id ? (
          <>
            <Grid item className={cx(classes.col, classes.colxs)}>
              <Typography variant="caption">Use</Typography>
            </Grid>
            <Grid item className={cx(classes.col, classes.colxs)}>
              <Typography variant="caption">Rows</Typography>
            </Grid>
            <Grid item className={cx(classes.col, classes.colxs)}>
              <Typography variant="caption">Columns</Typography>
            </Grid>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.TRANSFORMER]?.id ? (
          <>
            <Grid item className={cx(classes.col, classes.collg)}>
              <Typography variant="caption">Sources</Typography>
            </Grid>
            <Grid item className={cx(classes.col, classes.collg)}>
              <Typography variant="caption">Targets</Typography>
            </Grid>
          </>
        ) : null}
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography variant="caption">Namespace</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography variant="caption">Datasource</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography variant="caption">Owners</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colsm)}>
          <Typography variant="caption">Created</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colsm)}>
          <Typography variant="caption">Last Update</Typography>
        </Grid>
      </Grid>
      <SearchResultsSkeletonWrapper
        searchResultsContainerRef={searchResultsContainerRef}
        loading={isFetching}
      >
        <div
          id="results-list"
          className={cx(classes.listContainer, classes.resultsTable)}
          ref={searchResultsContainerRef}
        >
          {searchResults?.length ? (
            <InfiniteScroll
              dataLength={searchResults.length}
              next={fetchNextPage}
              hasMore={!!pageInfo.hasNext}
              loader={
                <div className={classes.spinnerContainer}>
                  <CircularProgress color="primary" size={30} />
                </div>
              }
              scrollThreshold="200px"
              scrollableTarget="results-list"
            >
              {searchResults.map(searchResult => (
                <ResultItem
                  key={searchResult.id}
                  searchType={searchType}
                  classes={{ container: classes.resultItem }}
                  searchResult={searchResult}
                  totals={totals}
                />
              ))}
            </InfiniteScroll>
          ) : null}
        </div>
      </SearchResultsSkeletonWrapper>
      {!isFetching && !searchResults?.length ? (
        <Typography variant="subtitle1">No Matches Found</Typography>
      ) : null}
    </div>
  );
};

export default Results;
