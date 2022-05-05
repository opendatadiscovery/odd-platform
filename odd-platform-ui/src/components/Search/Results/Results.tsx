import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import get from 'lodash/get';
import { Dictionary } from 'lodash/index';
import { useScrollBarWidth } from 'lib/hooks';
import {
  DataEntity,
  DataEntityClass,
  DataEntityClassNameEnum,
  SearchApiGetSearchResultsRequest,
} from 'generated-sources';
import {
  CurrentPageInfo,
  SearchClass,
  SearchTotalsByName,
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
  dataEntityClassesDict: Dictionary<DataEntityClass>;
  searchId: string;
  searchClass?: SearchClass;
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
  dataEntityClassesDict,
  searchId,
  searchClass,
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

  const [tabs, setTabs] = React.useState<AppTabItem<SearchClass>[]>([]);

  React.useEffect(() => {
    setTabs([
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
        hint: totals[DataEntityClassNameEnum.SET]?.count || 0,
        value: totals[DataEntityClassNameEnum.SET]?.id,
      },
      {
        name: 'Transformers',
        hint: totals[DataEntityClassNameEnum.TRANSFORMER]?.count || 0,
        value: totals[DataEntityClassNameEnum.TRANSFORMER]?.id,
      },
      {
        name: 'Data Consumers',
        hint: totals[DataEntityClassNameEnum.CONSUMER]?.count || 0,
        value: totals[DataEntityClassNameEnum.CONSUMER]?.id,
      },
      {
        name: 'Data Inputs',
        hint: totals[DataEntityClassNameEnum.INPUT]?.count || 0,
        value: totals[DataEntityClassNameEnum.INPUT]?.id,
      },
      {
        name: 'Quality Tests',
        hint: totals[DataEntityClassNameEnum.QUALITY_TEST]?.count || 0,
        value: totals[DataEntityClassNameEnum.QUALITY_TEST]?.id,
      },
      {
        name: 'Groups',
        hint: totals[DataEntityClassNameEnum.ENTITY_GROUP]?.count || 0,
        value: totals[DataEntityClassNameEnum.ENTITY_GROUP]?.id,
      },
    ]);
  }, [totals]);
  const scrollbarWidth = useScrollBarWidth();

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      searchClass ? tabs.findIndex(tab => tab.value === searchClass) : 0
    );
  }, [tabs, searchClass]);

  const onSearchClassChange = (newTypeIndex: number) => {
    const newType = tabs[newTypeIndex]?.value
      ? get(dataEntityClassesDict, `${tabs[newTypeIndex].value}`)
      : null;
    dispatch(
      actions.changeDataEntitySearchFilterAction({
        facetName: 'entityClasses',
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
    <Grid sx={{ mt: 2 }}>
      {isSearchCreatingAndFetching ? (
        <SearchTabsSkeleton length={tabs.length} />
      ) : (
        <AppTabs
          type="primary"
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={onSearchClassChange}
          isHintUpdated={isSearchUpdated}
        />
      )}
      {tabs[selectedTab]?.name === 'Groups' && (
        <div>lul</div>
        // <DataEntityGroupForm
        //   btnCreateEl={
        //     <AppButton
        //       sx={{ mt: 2 }}
        //       size="medium"
        //       color="primaryLight"
        //       startIcon={<AddIcon />}
        //     >
        //       Add group
        //     </AppButton>
        //   }
        // />
      )}
      <S.ResultsTableHeader
        container
        sx={{ mt: 2, pr: scrollbarWidth }}
        wrap="nowrap"
      >
        <S.ColContainer item $colType="collg">
          <Typography variant="caption">Name</Typography>
        </S.ColContainer>
        {searchClass &&
        searchClass === totals[DataEntityClassNameEnum.SET]?.id ? (
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
        {searchClass &&
        searchClass === totals[DataEntityClassNameEnum.TRANSFORMER]?.id ? (
          <>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Sources</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Targets</Typography>
            </S.ColContainer>
          </>
        ) : null}
        {searchClass &&
        searchClass ===
          totals[DataEntityClassNameEnum.QUALITY_TEST]?.id ? (
          <>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Entities</Typography>
            </S.ColContainer>
            <S.ColContainer item $colType="collg">
              <Typography variant="caption">Suite URL</Typography>
            </S.ColContainer>
          </>
        ) : null}
        {searchClass &&
        searchClass === totals[DataEntityClassNameEnum.CONSUMER]?.id ? (
          <S.ColContainer item $colType="collg">
            <Typography variant="caption">Source</Typography>
          </S.ColContainer>
        ) : null}
        {searchClass &&
        searchClass ===
          totals[DataEntityClassNameEnum.ENTITY_GROUP]?.id ? (
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
            hasMore={pageInfo.hasNext}
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
                key={searchResult.id}
                searchClass={searchClass}
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
    </Grid>
  );
};

export default Results;
