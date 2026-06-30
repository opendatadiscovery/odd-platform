import InfiniteScroll from 'react-infinite-scroll-component';
import React, { useEffect, useMemo } from 'react';
import { AssetKind } from 'generated-sources';
import { useSearchQueryExamples } from 'lib/hooks/api/dataModelling/searchQueryExamples';
import {
  EmptyContentPlaceholder,
  QueryExamplesListHeader,
  QueryExamplesListItem,
  QueryExamplesSkeleton,
  ScrollableContainer,
} from 'components/shared/elements';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchFavoritesStatus } from 'redux/thunks';
import { useSearchParams } from 'react-router-dom';
import { toolbarHeight } from 'lib/constants';

const QueryExamplesList = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const searchId = useMemo(() => searchParams.get('querySearchId') ?? '', [searchParams]);
  const { data, fetchNextPage, hasNextPage, isLoading } = useSearchQueryExamples({
    searchId,
    size: 30,
    enabled: !!searchId,
  });

  const queryExamples = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  // Hydrate the favorited status of every visible query example in one batch, so each row's star
  // renders without firing its own per-row request (the catalog Results.tsx pattern).
  useEffect(() => {
    if (queryExamples.length === 0) return;
    dispatch(
      fetchFavoritesStatus({
        assetRef: queryExamples.map(qe => ({
          assetKind: AssetKind.QUERY_EXAMPLE,
          assetId: qe.id,
        })),
      })
    );
  }, [queryExamples]);

  const isEmpty = useMemo(
    () => queryExamples.length === 0 && !isLoading,
    [queryExamples.length, isLoading]
  );

  return (
    <ScrollableContainer
      container
      id='query-examples-list'
      $offsetY={165}
      sx={{
        // Shrink to the rows (so the horizontal scrollbar sits under them) and make that scrollbar
        // prominent, so the trailing Recently-viewed column is reachable (#1816 / CTRIB-044).
        height: 'unset',
        maxHeight: `calc(100vh - ${toolbarHeight}px - 165px)`,
        '&::-webkit-scrollbar:horizontal': { height: '12px' },
        '&::-webkit-scrollbar-thumb:horizontal': {
          backgroundColor: '#C1C7D0',
          borderRadius: '6px',
          border: '3px solid transparent',
          backgroundClip: 'content-box',
          '&:hover': { backgroundColor: '#8993A4' },
        },
        '&::-webkit-scrollbar-track:horizontal': { backgroundColor: '#F4F5F7' },
      }}
    >
      <QueryExamplesListHeader showRecentlyViewed />
      <InfiniteScroll
        dataLength={queryExamples.length}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<QueryExamplesSkeleton />}
        scrollThreshold='200px'
        scrollableTarget='query-examples-list'
        style={{ overflow: 'visible' }}
      >
        {queryExamples.map(qe => (
          <QueryExamplesListItem
            queryExample={qe}
            showFavorite
            key={JSON.stringify(qe)}
          />
        ))}
        {isLoading && <QueryExamplesSkeleton />}
        {isEmpty && <EmptyContentPlaceholder offsetTop={215} />}
      </InfiniteScroll>
    </ScrollableContainer>
  );
};

export default QueryExamplesList;
