import React from 'react';
import { Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import get from 'lodash/get';
import { Dictionary } from 'lodash/index';
import {
  DataEntity,
  DataEntityType,
  DataEntityTypeNameEnum,
  SearchApiGetSearchResultsRequest,
} from 'generated-sources';
import {
  CurrentPageInfo,
  SearchTotalsByName,
  SearchType,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SearchResultsSkeletonItem from 'components/Search/Results/SearchResultsSkeletonItem/SearchResultsSkeletonItem';
import SearchTabsSkeleton from 'components/Search/Results/SearchTabsSkeleton/SearchTabsSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import ResultItem from 'components/Search/Results/ResultItem/ResultItem';
import * as S from './ResultsStyles';

interface ResultsProps {
  dataEntityTypesByName: Dictionary<DataEntityType>;
  searchId: string;
  searchType?: SearchType;
  searchResults: DataEntity[];
  pageInfo: CurrentPageInfo;
  searchFiltersSynced: boolean;
  totals: SearchTotalsByName;
  getDataEntitiesSearchResults: (
    params: SearchApiGetSearchResultsRequest
  ) => void;
  isSearchFetching: boolean;
  isSearchCreatingAndFetching: boolean;
  isSearchUpdated: boolean;
  isSearchCreating: boolean;
}

const Results: React.FC<ResultsProps> = ({
  dataEntityTypesByName,
  searchId,
  searchType,
  searchResults,
  pageInfo,
  totals,
  searchFiltersSynced,
  getDataEntitiesSearchResults,
  isSearchFetching,
  isSearchCreatingAndFetching,
  isSearchUpdated,
  isSearchCreating,
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
    {
      name: 'Groups',
      hint: totals[DataEntityTypeNameEnum.ENTITY_GROUP]?.count || 0,
      value: totals[DataEntityTypeNameEnum.ENTITY_GROUP]?.id,
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
    if (searchFiltersSynced && searchId && !isSearchCreating) {
      fetchNextPage();
    }
  }, [searchFiltersSynced, searchId, isSearchCreating]);

  return (
    <S.Container sx={{ mt: 2 }}>
      {isSearchCreatingAndFetching ? (
        <SearchTabsSkeleton length={tabs.length} />
      ) : (
        <AppTabs
          type="primary"
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={onSearchTypeChange}
          isHintUpdated={isSearchUpdated}
        />
      )}
      <S.ResultsTableHeader container sx={{ mt: 2 }} wrap="nowrap">
        <S.ColContainer item $colType="collg">
          <Typography variant="caption">Name</Typography>
        </S.ColContainer>
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.SET]?.id ? (
          <>
            <S.ColContainer item $colType="colxs">
              <Typography variant="caption">Use</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType="colxs">
              <Typography variant="caption">Rows</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType="colxs">
              <Typography variant="caption">Columns</Typography>
            </S.ColContainer>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.TRANSFORMER]?.id ? (
          <>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Sources</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Targets</Typography>
            </S.ColContainer>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.QUALITY_TEST]?.id ? (
          <>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Entities</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Suite URL</Typography>
            </S.ColContainer>
          </>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.CONSUMER]?.id ? (
          <S.ColContainer item $colType="collg">
            <Typography variant="caption">Source</Typography>
          </S.ColContainer>
        ) : null}
        {searchType &&
        searchType === totals[DataEntityTypeNameEnum.ENTITY_GROUP]?.id ? (
          <S.ColContainer item $colType="colxs">
            <Typography variant="caption">Number of entities</Typography>
          </S.ColContainer>
        ) : null}
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Namespace</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Datasource</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colmd">
          <Typography variant="caption">Owners</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colsm">
          <Typography variant="caption">Created</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="colsm">
          <Typography variant="caption">Last Update</Typography>
        </S.ColContainer>
      </S.ResultsTableHeader>
      {isSearchCreating ? (
        <SkeletonWrapper
          length={10}
          renderContent={({ randomSkeletonPercentWidth, key }) => (
            <SearchResultsSkeletonItem
              width={randomSkeletonPercentWidth()}
              key={key}
            />
          )}
        />
      ) : (
        <S.ListContainer id="results-list">
          <InfiniteScroll
            dataLength={searchResults.length}
            next={fetchNextPage}
            hasMore={!!pageInfo.hasNext}
            loader={
              isSearchFetching && (
                <SkeletonWrapper
                  length={10}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <SearchResultsSkeletonItem
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
                  )}
                />
              )
            }
            scrollThreshold="200px"
            scrollableTarget="results-list"
          >
            {searchResults.map(searchResult => (
              <ResultItem
                dataEntityId={searchResult.id}
                key={searchResult.id}
                searchType={searchType}
                searchResult={searchResult}
                totals={totals}
              />
            ))}
          </InfiniteScroll>
          {!isSearchFetching && !pageInfo.total ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </S.ListContainer>
      )}
    </S.Container>
  );
};

export default Results;
