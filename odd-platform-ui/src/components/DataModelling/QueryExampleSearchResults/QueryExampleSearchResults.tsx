import InfiniteScroll from 'react-infinite-scroll-component';
import React, { useMemo } from 'react';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import { useTheme } from 'styled-components';
import { useSearchQueryExamples } from 'lib/hooks/api/dataModelling/searchQueryExamples';
import {
  EmptyContentPlaceholder,
  QueryExamplesListItem,
  QueryExamplesSkeleton,
} from 'components/shared/elements';
import { ScrollableYGrid } from 'components/shared/styled-components/ScrollableYGrid';

interface QueryExampleSearchResultsProps {
  searchId: string;
}

const querySearchHeight = 40;

const QueryExampleSearchResults = ({ searchId }: QueryExampleSearchResultsProps) => {
  const theme = useTheme();
  const { data, fetchNextPage, hasNextPage, isLoading } = useSearchQueryExamples({
    searchId,
    size: 30,
  });

  const queryExamples = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const isEmpty = useMemo(
    () => queryExamples.length === 0 && !isLoading,
    [queryExamples.length, isLoading]
  );

  const calculatedHeight = `calc(100vh - ${toolbarHeight}px - ${querySearchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`;

  return (
    <ScrollableYGrid height={calculatedHeight} item xs={12} id='query-examples-list'>
      <InfiniteScroll
        dataLength={queryExamples.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<QueryExamplesSkeleton />}
        scrollThreshold='200px'
        scrollableTarget='query-examples-list'
      >
        {queryExamples.map(qe => (
          <QueryExamplesListItem queryExample={qe} key={qe.definition} />
        ))}
        {isLoading && <QueryExamplesSkeleton />}
        {isEmpty && <EmptyContentPlaceholder />}
      </InfiniteScroll>
    </ScrollableYGrid>
  );
};

export default QueryExampleSearchResults;
