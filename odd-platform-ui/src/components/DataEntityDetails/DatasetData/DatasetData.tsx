import React, { useMemo } from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import { getDatasetLookupTableId } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import { useGetLookupTable } from 'lib/hooks';
import { Grid } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useGetReferenceData } from 'lib/hooks/api/masterData/referenceData';
import { EmptyContentPlaceholder, ScrollableContainer } from 'components/shared/elements';
import LookupTablesSkeleton from 'components/MasterData/LookupTables/LookupTablesSkeleton';
import DatasetDataListHeader from './DatasetDataList/DatasetDataListHeader';

const DatasetData: React.FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();
  const lookupTableId = useAppSelector(getDatasetLookupTableId(dataEntityId));
  const { data: lookupTable } = useGetLookupTable({
    lookupTableId: lookupTableId ?? 0,
    enabled: !!lookupTableId,
  });

  const { data, hasNextPage, fetchNextPage, isLoading } = useGetReferenceData({
    lookupTableId: lookupTableId ?? 0,
    size: 30,
    enabled: !!lookupTableId,
  });

  const lookupTableRowList = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const isEmpty = useMemo(
    () => lookupTableRowList.length === 0 && !isLoading,
    [lookupTableRowList, isLoading]
  );

  if (!lookupTable) return null;

  return (
    <Grid container mt={2}>
      <Grid item xs={12}>
        <DatasetDataListHeader fields={lookupTable.fields} />
      </Grid>
      <Grid item xs={12}>
        <ScrollableContainer container id='reference-data-list' $offsetY={175}>
          <InfiniteScroll
            scrollableTarget='reference-data-list'
            dataLength={lookupTableRowList.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            scrollThreshold='200px'
            loader={<LookupTablesSkeleton />}
          >
            {isEmpty && <EmptyContentPlaceholder offsetTop={225} />}
          </InfiniteScroll>
        </ScrollableContainer>
      </Grid>
    </Grid>
  );
};

export default DatasetData;
