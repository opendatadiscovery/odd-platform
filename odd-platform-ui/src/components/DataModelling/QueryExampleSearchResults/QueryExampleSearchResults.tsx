import InfiniteScroll from 'react-infinite-scroll-component';
import { Grid } from '@mui/material';
import React, { useMemo } from 'react';
import { useSearchQueryExamples } from 'lib/hooks/api/dataModelling/searchQueryExample';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import { useTheme } from 'styled-components';
import ThreadMessageSkeleton from '../../DataEntityDetails/DataCollaboration/CurrentMessage/Thread/ThreadContent/ThreadMessage/ThreadMessageSkeleton';
import QueryExampleSearchResultsItem from '../QueryExampleSearchResultsItem/QueryExampleSearchResultsItem';

interface QueryExampleSearchResultsProps {
  searchId: string;
}

const querySearchHeight = 40;

const QueryExampleSearchResults = ({ searchId }: QueryExampleSearchResultsProps) => {
  const theme = useTheme();
  const { data, fetchNextPage, hasNextPage, isFetching } = useSearchQueryExamples({
    searchId,
    size: 30,
  });

  const queryExamples = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const calculatedHeight = `calc(100vh - ${toolbarHeight}px - ${querySearchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`;
  return (
    <Grid item xs={12} id='query-examples-list' sx={{ height: calculatedHeight }}>
      <InfiniteScroll
        dataLength={queryExamples.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<ThreadMessageSkeleton />}
        scrollThreshold='200px'
        scrollableTarget='query-examples-list'
      >
        {queryExamples.map(qe => (
          <QueryExampleSearchResultsItem queryExample={qe} key={qe.definition} />
        ))}
        {isFetching && <ThreadMessageSkeleton />}
      </InfiniteScroll>
    </Grid>
  );
};

export default QueryExampleSearchResults;
