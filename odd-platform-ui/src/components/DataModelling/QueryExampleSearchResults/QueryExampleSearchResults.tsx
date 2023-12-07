import InfiniteScroll from 'react-infinite-scroll-component';
import React, { useMemo } from 'react';
import { useSearchQueryExamples } from 'lib/hooks/api/dataModelling/searchQueryExamples';
import {
  EmptyContentPlaceholder,
  QueryExamplesListItem,
  QueryExamplesSkeleton,
  ScrollableContainer,
} from 'components/shared/elements';

interface QueryExampleSearchResultsProps {
  searchId: string;
}

const QueryExampleSearchResults = ({ searchId }: QueryExampleSearchResultsProps) => {
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

  return (
    <ScrollableContainer container id='query-examples-list' $offsetY={165}>
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
        {isEmpty && <EmptyContentPlaceholder offsetTop={215} />}
      </InfiniteScroll>
    </ScrollableContainer>
  );
};

export default QueryExampleSearchResults;
